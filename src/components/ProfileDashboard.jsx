"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import { getUserProfile } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { getUserPostedBooks, getUserArchivedBooks, patchBook } from '@/services/books';
import { getRegions } from '@/services/regions';
import http from '@/lib/http';
import { API_ENDPOINTS } from '@/config';
import Spin from './Spin';
import BookCreateModal from './BookCreateModal';
import ProfileSidebar from './profile/ProfileSidebar';
import ProfileTabs from './profile/ProfileTabs';

const ProfileDashboard = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const tProfile = useTranslations("ProfileDashboard");
  const tProduct = useTranslations("ProductDetailsOne");
  const tProfileForm = useTranslations("ProfileForm");
  const tProfileMessages = useTranslations("Profile");
  const tLocation = useTranslations("Location");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [userBooks, setUserBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [archivingBookId, setArchivingBookId] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  // Profile editing states
  const profileDefaults = {
    first_name: '',
    last_name: '',
    app_phone_number: '',
    bio: '',
    region: '',
    district: '',
    location_text: '',
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState(() => ({ ...profileDefaults }));
  const [originalProfileData, setOriginalProfileData] = useState(() => ({ ...profileDefaults }));
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getIdAsString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      if (value.id !== undefined && value.id !== null) {
        return String(value.id);
      }
      if ('value' in value && value.value !== undefined && value.value !== null) {
        return String(value.value);
      }
      return '';
    }
    return String(value);
  };

  const toNumberOrNull = (value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizeProfileData = (user) => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    app_phone_number: user?.app_phone_number || '',
    bio: user?.bio || '',
    region: getIdAsString(user?.region),
    district: getIdAsString(user?.district),
    location_text: user?.location_text || '',
  });

  const normalizeProfileStateMerge = (data = {}) => {
    const normalized = { ...data };
    if ('region' in normalized) {
      normalized.region =
        normalized.region !== undefined && normalized.region !== null
          ? String(normalized.region)
          : '';
    }
    if ('district' in normalized) {
      normalized.district =
        normalized.district !== undefined && normalized.district !== null
          ? String(normalized.district)
          : '';
    }
    return normalized;
  };

  const hasProfileDifferences = (current, original = originalProfileData) => {
    const keys = new Set([
      ...Object.keys(original || {}),
      ...Object.keys(current || {})
    ]);

    for (const key of keys) {
      const currentValue = current?.[key] ?? '';
      const originalValue = original?.[key] ?? '';
      if (currentValue !== originalValue) {
        return true;
      }
    }

    return false;
  };

  const findRegionById = (id) => {
    if (id === null || id === undefined || id === '') return null;
    return regions.find(region => String(region.id) === String(id)) || null;
  };

  const findDistrictById = (districtId) => {
    if (districtId === null || districtId === undefined || districtId === '') return null;
    for (const region of regions) {
      const district = region?.districts?.find(d => String(d.id) === String(districtId));
      if (district) {
        return district;
      }
    }
    return null;
  };

  const getRegionDisplayName = () => {
    if (userData?.region && typeof userData.region === 'object') {
      return userData.region.name || '';
    }
    if (userData?.region_name) {
      return userData.region_name;
    }
    if (userData?.region !== undefined && userData?.region !== null && userData?.region !== '') {
      return findRegionById(userData.region)?.name || String(userData.region);
    }
    if (profileFormData.region) {
      return findRegionById(profileFormData.region)?.name || '';
    }
    return '';
  };

  const applyProfileUpdate = (updatedUser, fallbackData = null) => {
    if (updatedUser && typeof updatedUser === 'object') {
      setUserData(updatedUser);
      initializeProfileForm(updatedUser);
      return;
    }

    if (fallbackData) {
      const normalizedFallback = normalizeProfileStateMerge(fallbackData);
      setUserData(prev => ({
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
    if (userData?.district && typeof userData.district === 'object') {
      return userData.district.name || '';
    }
    if (userData?.district_name) {
      return userData.district_name;
    }
    if (userData?.district !== undefined && userData?.district !== null && userData?.district !== '') {
      return findDistrictById(userData.district)?.name || String(userData.district);
    }
    if (profileFormData.district) {
      return findDistrictById(profileFormData.district)?.name || '';
    }
    return '';
  };

  const fetchBooksData = async (userId) => {
    try {
      setBooksLoading(true);
      const [activeResponse, archivedResponse] = await Promise.all([
        getUserPostedBooks(userId, 20),
        getUserArchivedBooks(userId, 20)
      ]);
      setUserBooks(activeResponse.books || []);
      setArchivedBooks(archivedResponse.books || []);
    } catch (error) {
      console.error('Error fetching books data:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleCreateBook = () => {
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
        alert(
          tProduct("archiveUnknownError", {
            message: response?.message || tProduct("unknownError"),
          })
        );
      } else {
        alert(tProduct("archiveSuccess"));
      }

      await fetchBooksData(userData.id);
    } catch (error) {
      console.error("Error archiving book:", error);
      alert(tProduct("archiveError"));
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

  const handleAvatarButtonClick = () => {
    if (avatarUploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('picture', file);

    try {
      setAvatarUploading(true);
      const { data } = await http.patch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, formData);
      const updatedUser = data?.user || data;
      applyProfileUpdate(updatedUser);
      alert(tProfileMessages("updated"));
    } catch (error) {
      console.error('💥 Error updating avatar:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      alert(tProfileMessages("updateError"));
    } finally {
      setAvatarUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Profile editing functions
  const initializeProfileForm = (user) => {
    const normalized = normalizeProfileData(user || {});
    setProfileFormData(normalized);
    setOriginalProfileData(normalized);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => {
      const nextState = {
        ...prev,
        [name]: value,
        ...(name === 'region' ? { district: '' } : {})
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
      };

      // Remove empty/null values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([_, value]) =>
            value !== null &&
            value !== '' &&
            value !== undefined &&
            !(typeof value === 'number' && Number.isNaN(value))
        )
      );

      console.log('🔄 Sending PATCH request to v1/auth/me/update with data:', cleanedData);
      console.log('📡 API Endpoint:', API_ENDPOINTS.AUTH.UPDATE_PROFILE);
      console.log('🌐 Full URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kitobzor.uz/'}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`);

      // Direct API call
      const { data } = await http.patch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, cleanedData);
      
      console.log('📥 API Response:', data);
      
      const success = data?.success !== false;
      
      if (success) {
        console.log('✅ Profile updated successfully:', data?.message || 'Profile updated successfully');
        const updatedUser = data?.user || data;
        applyProfileUpdate(updatedUser, cleanedData);
        setIsEditingProfile(false);
        setHasChanges(false);
        
        // Show success message
        alert(tProfileMessages("updated"));
      } else {
        console.error('❌ Failed to update profile:', data?.message || 'Unknown error');
        alert(tProfileMessages("updateError"));
      }
    } catch (error) {
      console.error('💥 Error updating profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      alert(tProfileMessages("updateError"));
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
        
        // Fetch books data after user data is loaded
        if (user?.id) {
          await fetchBooksData(user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const fetchRegionsData = async () => {
      try {
        setRegionsLoading(true);
        const response = await getRegions({ limit: 100 });
        setRegions(response.regions || []);
      } catch (error) {
        console.error('Error fetching regions data:', error);
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
      <section className='account py-80'>
        <div className='container container-lg'>
          <div className='d-flex justify-content-center align-items-center py-80'>
            <Spin text={tProfile("loadingData")} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='account py-60' style={{backgroundColor: '#f8f9fa'}}>
      <div className='container container-lg'>
        <div className='row g-4'>
          <div className='col-lg-4'>
            <ProfileSidebar
              userData={userData}
              userBooksCount={userBooks.length}
              archivedBooksCount={archivedBooks.length}
              isEditingProfile={isEditingProfile}
              profileFormData={profileFormData}
              regions={regions}
              regionsLoading={regionsLoading}
              districtOptions={districtOptions}
              hasChanges={hasChanges}
              saving={saving}
              avatarUploading={avatarUploading}
              fileInputRef={fileInputRef}
              onAvatarButtonClick={handleAvatarButtonClick}
              onAvatarChange={handleAvatarChange}
              onInputChange={handleProfileInputChange}
              onEditProfile={handleEditProfile}
              onCancelEdit={handleCancelEdit}
              onSaveProfile={handleSaveProfile}
              onLogout={logout}
              regionDisplayName={regionDisplayName}
              districtDisplayName={districtDisplayName}
            />
          </div>

          <div className='col-lg-8'>
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              userData={userData}
              userBooks={userBooks}
              archivedBooks={archivedBooks}
              booksLoading={booksLoading}
              onCreateBook={handleCreateBook}
              onEditBook={handleEditBook}
            onArchiveBook={handleArchiveBook}
            archivingBookId={archivingBookId}
            />
          </div>
        </div>
      </div>
      
      {/* Book Create/Edit Modal */}
      <BookCreateModal
        isOpen={showBookModal}
        onClose={handleCloseModal}
        onSuccess={handleBookSuccess}
        editBook={editingBook}
      />

    </section>
  );
};

export default ProfileDashboard;
