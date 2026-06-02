"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Box, Stack, Button } from "@mui/material";
import { getUserProfile, updateUserProfile } from "@/services/auth";
import { isProfileComplete } from "@/utils/profile";
import { useAuth } from "@/hooks/useAuth";
import { getUserPostedBooks, getUserArchivedBooks, patchBook } from "@/services/books";
import { getRegions } from "@/services/regions";
import { getShopsByOwner } from "@/services/shops";
import { Link } from "@/i18n/navigation";
import { mapValidationError } from "@/lib/mapValidationError";
import { openShareSheet } from "@/lib/shareSheet";
import Icon from "@/components/Icon";
import Spin from "./Spin";
import BookCreateModal from "./BookCreateModal";
import ProfileHero from "./profile/ProfileHero";
import ProfileStoryBar from "./profile/ProfileStoryBar";
import ProfileInfoList from "./profile/ProfileInfoList";
import ProfileEditModal from "./profile/ProfileEditModal";
import ProfileTabs from "./profile/ProfileTabs";
import StoryCreateModal from "./profile/StoryCreateModal";
import { useToast } from "./Toast";

const ProfileDashboard = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const locale = useLocale();
  const tProfile = useTranslations("ProfileDashboard");
  const tProduct = useTranslations("ProductDetailsOne");
  const tProfileMessages = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const tShopLoc = useTranslations("ShopLocation");
  const { showToast, ToastContainer } = useToast();
  const searchParams = useSearchParams();
  const completePromptShownRef = useRef(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("books");
  const [userBooks, setUserBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [userShops, setUserShops] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [archivingBookId, setArchivingBookId] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Profile editing states
  const profileDefaults = {
    first_name: "",
    last_name: "",
    app_phone_number: "",
    bio: "",
    region: "",
    district: "",
    location_text: "",
    gender: "",
    birth_date: "",
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState(() => ({ ...profileDefaults }));
  const [originalProfileData, setOriginalProfileData] = useState(() => ({ ...profileDefaults }));
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const getIdAsString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      if (value.id !== undefined && value.id !== null) {
        return String(value.id);
      }
      if ("value" in value && value.value !== undefined && value.value !== null) {
        return String(value.value);
      }
      return "";
    }
    return String(value);
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizeProfileData = (user) => ({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    app_phone_number: user?.app_phone_number || "",
    bio: user?.bio || "",
    region: getIdAsString(user?.region),
    district: getIdAsString(user?.district),
    location_text: user?.location_text || "",
    gender: user?.gender || "",
    birth_date: user?.birth_date || "",
  });

  const normalizeProfileStateMerge = (data = {}) => {
    const normalized = { ...data };
    if ("region" in normalized) {
      normalized.region =
        normalized.region !== undefined && normalized.region !== null
          ? String(normalized.region)
          : "";
    }
    if ("district" in normalized) {
      normalized.district =
        normalized.district !== undefined && normalized.district !== null
          ? String(normalized.district)
          : "";
    }
    return normalized;
  };

  const hasProfileDifferences = (current, original = originalProfileData) => {
    const keys = new Set([...Object.keys(original || {}), ...Object.keys(current || {})]);

    for (const key of keys) {
      const currentValue = current?.[key] ?? "";
      const originalValue = original?.[key] ?? "";
      if (currentValue !== originalValue) {
        return true;
      }
    }

    return false;
  };

  const findRegionById = (id) => {
    if (id === null || id === undefined || id === "") return null;
    return regions.find((region) => String(region.id) === String(id)) || null;
  };

  const findDistrictById = (districtId) => {
    if (districtId === null || districtId === undefined || districtId === "") return null;
    for (const region of regions) {
      const district = region?.districts?.find((d) => String(d.id) === String(districtId));
      if (district) {
        return district;
      }
    }
    return null;
  };

  const getRegionDisplayName = () => {
    if (userData?.region && typeof userData.region === "object") {
      return userData.region.name || "";
    }
    if (userData?.region_name) {
      return userData.region_name;
    }
    if (userData?.region !== undefined && userData?.region !== null && userData?.region !== "") {
      return findRegionById(userData.region)?.name || String(userData.region);
    }
    if (profileFormData.region) {
      return findRegionById(profileFormData.region)?.name || "";
    }
    return "";
  };

  const applyProfileUpdate = (updatedUser, fallbackData = null) => {
    if (updatedUser && typeof updatedUser === "object") {
      setUserData(updatedUser);
      initializeProfileForm(updatedUser);
      return;
    }

    if (fallbackData) {
      const normalizedFallback = normalizeProfileStateMerge(fallbackData);
      setUserData((prev) => ({
        ...prev,
        ...normalizedFallback,
      }));
      const mergedProfile = {
        ...profileFormData,
        ...normalizedFallback,
      };
      setProfileFormData(mergedProfile);
      setOriginalProfileData(mergedProfile);
    }
  };

  const getDistrictDisplayName = () => {
    if (userData?.district && typeof userData.district === "object") {
      return userData.district.name || "";
    }
    if (userData?.district_name) {
      return userData.district_name;
    }
    if (
      userData?.district !== undefined &&
      userData?.district !== null &&
      userData?.district !== ""
    ) {
      return findDistrictById(userData.district)?.name || String(userData.district);
    }
    if (profileFormData.district) {
      return findDistrictById(profileFormData.district)?.name || "";
    }
    return "";
  };

  const fetchBooksData = async (userId) => {
    try {
      setBooksLoading(true);
      const [activeResponse, archivedResponse] = await Promise.all([
        getUserPostedBooks(userId, 20),
        getUserArchivedBooks(userId, 20),
      ]);
      setUserBooks(activeResponse.books || []);
      setArchivedBooks(archivedResponse.books || []);
    } catch (error) {
      console.error("Error fetching books data:", error);
    } finally {
      setBooksLoading(false);
    }
  };

  const fetchShopsData = async (userId) => {
    try {
      const response = await getShopsByOwner(userId, 12);
      setUserShops(response.shops || []);
    } catch (error) {
      console.error("Error fetching shops data:", error);
      setUserShops([]);
    }
  };

  const handleShareProfile = () => {
    const fullName =
      [userData?.first_name, userData?.last_name].filter(Boolean).join(" ") || "Profile";
    openShareSheet({
      title: fullName,
      text: `${fullName} — Kitobzor`,
      url: `/${locale}/user/${userData?.id || ""}`,
    });
  };

  const handleCreateBook = () => {
    // Region + district are required before posting — send the user to the
    // profile editor (already open) instead of the book form.
    if (!isProfileComplete(userData)) {
      promptCompleteProfile();
      return;
    }
    setEditingBook(null);
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowBookModal(true);
  };

  const handleArchiveBook = async (book) => {
    if (!book?.id || !userData?.id) {
      return;
    }

    if (!window.confirm(tProduct("archiveConfirm"))) {
      return;
    }

    try {
      setArchivingBookId(book.id);
      setBooksLoading(true);

      const response = await patchBook(book.id, { is_active: false });

      if (response?.success === false) {
        showToast({
          type: "error",
          title: tCommon("error"),
          message: tProduct("archiveUnknownError", {
            message: response?.message || tProduct("unknownError"),
          }),
          duration: 4000,
        });
      } else {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: tProduct("archiveSuccess"),
          duration: 3000,
        });
      }

      await fetchBooksData(userData.id);
    } catch (error) {
      console.error("Error archiving book:", error);
      const mapped = mapValidationError(error);
      showToast({
        type: "error",
        title: tCommon("error"),
        message: mapped.general || tProduct("archiveError"),
        duration: 4000,
      });
    } finally {
      setArchivingBookId(null);
      setBooksLoading(false);
    }
  };

  const handleBookSuccess = (book) => {
    // Refresh books data
    if (userData?.id) {
      fetchBooksData(userData.id);
    }
  };

  const handleCloseModal = () => {
    setShowBookModal(false);
    setEditingBook(null);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("picture", file);

    try {
      setAvatarUploading(true);
      const { user } = await updateUserProfile(formData);
      applyProfileUpdate(user);
      showToast({
        type: "success",
        title: tCommon("success"),
        message: tProfileMessages("updated"),
        duration: 3000,
      });
    } catch (error) {
      console.error("💥 Error updating avatar:", error);
      const mapped = mapValidationError(error);
      showToast({
        type: "error",
        title: tCommon("error"),
        message: mapped.general || tProfileMessages("updateError"),
        duration: 4000,
      });
    } finally {
      setAvatarUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  // Profile editing functions. useCallback so the user-data effect's dep
  // array stays stable — otherwise the effect re-runs every render and
  // /me would be re-fetched in a loop. `normalizeProfileData` is a pure
  // helper defined inside the component; its identity changes each
  // render, but it only captures `getIdAsString`, which is itself pure —
  // so omitting it from deps is safe.
  const initializeProfileForm = useCallback((user) => {
    const normalized = normalizeProfileData(user || {});
    setProfileFormData(normalized);
    setOriginalProfileData(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open the profile editor and explain that region + district are required
  // before posting a book. Defined after initializeProfileForm so the dep
  // array doesn't touch it inside the temporal dead zone.
  const promptCompleteProfile = useCallback(() => {
    setIsEditingProfile(true);
    initializeProfileForm(userData);
    showToast({
      type: "info",
      title: tProfile("infoTitle"),
      message: tProfile("completeProfilePrompt"),
      duration: 5000,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, initializeProfileForm, showToast, tProfile]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: value,
        ...(name === "region" ? { district: "" } : {}),
      };
      setHasChanges(hasProfileDifferences(nextState, originalProfileData));
      return nextState;
    });
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    initializeProfileForm(userData);
    setHasChanges(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileFormData(originalProfileData);
    setHasChanges(false);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Prepare data for API (only include fields that can be updated)
      const updateData = {
        first_name: profileFormData.first_name,
        last_name: profileFormData.last_name,
        app_phone_number: profileFormData.app_phone_number,
        bio: profileFormData.bio,
        region: toNumberOrNull(profileFormData.region),
        district: toNumberOrNull(profileFormData.district),
        location_text: profileFormData.location_text,
        gender: profileFormData.gender,
        birth_date: profileFormData.birth_date,
      };

      // Remove empty/null values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([_, value]) =>
            value !== null &&
            value !== "" &&
            value !== undefined &&
            !(typeof value === "number" && Number.isNaN(value)),
        ),
      );

      const { success, user } = await updateUserProfile(cleanedData);

      if (success) {
        applyProfileUpdate(user, cleanedData);
        setIsEditingProfile(false);
        setHasChanges(false);

        showToast({
          type: "success",
          title: tCommon("success"),
          message: tProfileMessages("updated"),
          duration: 3000,
        });
      } else {
        console.error("❌ Failed to update profile:", message || "Unknown error");
        showToast({
          type: "error",
          title: tCommon("error"),
          message: tProfileMessages("updateError"),
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("💥 Error updating profile:", error);
      const mapped = mapValidationError(error);
      showToast({
        type: "error",
        title: tCommon("error"),
        message: mapped.general || tProfileMessages("updateError"),
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserProfile();
        const user = response.user || response.raw;
        setUserData(user);

        // Initialize profile form data
        initializeProfileForm(user);

        // Fetch books and shops data after user data is loaded
        if (user?.id) {
          await Promise.all([fetchBooksData(user.id), fetchShopsData(user.id)]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, authLoading, initializeProfileForm]);

  // Arrived from the "post a book" gate (`?complete=book`) with an incomplete
  // profile → open the editor and explain why. Runs once, after userData loads.
  useEffect(() => {
    if (completePromptShownRef.current) return;
    if (!userData) return;
    if (searchParams?.get("complete") !== "book") return;
    if (isProfileComplete(userData)) return;
    completePromptShownRef.current = true;
    promptCompleteProfile();
  }, [userData, searchParams, promptCompleteProfile]);

  useEffect(() => {
    const fetchRegionsData = async () => {
      try {
        setRegionsLoading(true);
        const response = await getRegions({ limit: 100 });
        setRegions(response.regions || []);
      } catch (error) {
        console.error("Error fetching regions data:", error);
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegionsData();
  }, []);

  const selectedRegion = findRegionById(profileFormData.region);
  const districtOptions = selectedRegion?.districts || [];
  const regionDisplayName = getRegionDisplayName();
  const districtDisplayName = getDistrictDisplayName();

  if (loading) {
    return (
      <section className="account py-80">
        <div className="container container-lg">
          <div className="d-flex justify-content-center align-items-center py-80">
            <Spin text={tProfile("loadingData")} />
          </div>
        </div>
      </section>
    );
  }

  const locationParts = [regionDisplayName, districtDisplayName].filter(Boolean);
  const locationChip = locationParts.join(" · ");
  const locationFull = [...locationParts, userData?.location_text].filter(Boolean).join(" · ");
  const roleLabel =
    userData?.user_type === "bookshop" ? tProfile("bookshopOwner") : tProfile("user");

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-page)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        py: { xs: 2.5, md: 5 },
      }}
    >
      <Box
        sx={{
          maxWidth: 720,
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <ProfileHero
            user={userData}
            stats={{
              books: userBooks.length,
              archive: archivedBooks.length,
              shops: userShops.length,
            }}
            avatarUploading={avatarUploading}
            onAvatarChange={handleAvatarChange}
            onEditClick={handleEditProfile}
            onShareClick={handleShareProfile}
            locationLine={locationChip}
            roleLabel={roleLabel}
          />

          <ProfileStoryBar books={userBooks} shops={userShops} onAddBookClick={handleCreateBook} />

          {userShops.length > 0 && (
            <Stack direction="row" sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => setShowStoryModal(true)}
                startIcon={
                  <Icon
                    className="ph ph-paper-plane-tilt"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  />
                }
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 5, px: 3 }}
              >
                {tProfile("addStory")}
              </Button>
              {/* Quick link to the owner's shop page, where the edit (pencil)
                  button lives — the editor was previously only reachable from
                  the public shop page, which owners couldn't find. */}
              {userShops.map((shop) => (
                <Button
                  key={shop.id}
                  component={Link}
                  href={`/shops/${shop.id}`}
                  variant="outlined"
                  startIcon={
                    <Icon
                      className="ph ph-storefront"
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    />
                  }
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 5, px: 3 }}
                >
                  {userShops.length > 1 ? shop.name : tShopLoc("myShop")}
                </Button>
              ))}
            </Stack>
          )}

          <ProfileInfoList user={userData} locationLine={locationFull} />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userData={userData}
            userBooks={userBooks}
            archivedBooks={archivedBooks}
            userShops={userShops}
            booksLoading={booksLoading}
            onCreateBook={handleCreateBook}
            onEditBook={handleEditBook}
            onArchiveBook={handleArchiveBook}
            archivingBookId={archivingBookId}
          />

          <Box sx={{ textAlign: "center", pt: 2 }}>
            <Button
              variant="text"
              color="error"
              onClick={logout}
              startIcon={
                <Icon className="ph ph-sign-out" style={{ fontSize: 18 }} aria-hidden="true" />
              }
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {tProfile("logout")}
            </Button>
          </Box>
        </Stack>
      </Box>

      <ProfileEditModal
        open={isEditingProfile}
        onClose={handleCancelEdit}
        profileFormData={profileFormData}
        onInputChange={handleProfileInputChange}
        regions={regions}
        regionsLoading={regionsLoading}
        districtOptions={districtOptions}
        hasChanges={hasChanges}
        saving={saving}
        onSave={handleSaveProfile}
      />

      <BookCreateModal
        isOpen={showBookModal}
        onClose={handleCloseModal}
        onSuccess={handleBookSuccess}
        editBook={editingBook}
      />

      <StoryCreateModal
        open={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        shops={userShops}
        onCreated={() => setShowStoryModal(false)}
      />

      <ToastContainer />
    </Box>
  );
};

export default ProfileDashboard;
