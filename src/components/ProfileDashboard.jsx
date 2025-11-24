"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import { getUserProfile } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { getUserPostedBooks, getUserArchivedBooks } from '@/services/books';
import { getUserPosts } from '@/services/posts';
import { getRegions } from '@/services/regions';
import http from '@/lib/http';
import { API_ENDPOINTS } from '@/config';
import BookCard from './BookCard';
import Spin from './Spin';
import BookCreateModal from './BookCreateModal';
import PostCard from './PostCard';
import PostCreateModal from './PostCreateModal';

const ProfileDashboard = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const tProfile = useTranslations("ProfileDashboard");
  const tProfileForm = useTranslations("ProfileForm");
  const tProfileMessages = useTranslations("Profile");
  const tLocation = useTranslations("Location");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [userBooks, setUserBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
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

  const fetchPostsData = async (userId) => {
    try {
      setPostsLoading(true);
      const response = await getUserPosts(userId, { limit: 20 });
      setUserPosts(response.posts || []);
    } catch (error) {
      console.error('Error fetching posts data:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowPostModal(true);
  };

  const handlePostSuccess = (post) => {
    // Refresh posts data
    if (userData?.id) {
      fetchPostsData(userData.id);
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setEditingPost(null);
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
          await fetchPostsData(user.id);
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

  const renderEmptyState = (iconClass, title, subtitle) => (
    <div className='text-center py-60'>
      <i className={`${iconClass} text-gray-300 text-5xl mb-16`}></i>
      <h5 className='text-gray-500 mb-0'>{title}</h5>
      <p className='text-gray-400 text-sm mt-8'>{subtitle}</p>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'books') {
      return (
        <div className='p-32'>
          <div className='d-flex align-items-center justify-content-between mb-24'>
            <div className='d-flex align-items-center gap-16'>
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>{tProfile("myBooks")}</h3>
              <span className='badge bg-main-100 text-main-600 px-12 py-4 rounded-pill text-xs'>{tProfile("activeBadge")}</span>
            </div>
            <button
              className='btn btn-main py-8 px-16 text-sm'
              onClick={handleCreateBook}
            >
              <i className='ph ph-plus me-8'></i>
              {tProfile("addBook")}
            </button>
          </div>
          {booksLoading ? (
            <div className='text-center py-60'>
              <Spin text={tProfile("booksLoading")} />
            </div>
          ) : userBooks.length > 0 ? (
            <div className='row g-4'>
              {userBooks.map((book) => (
                <div key={book.id} className='col-lg-4 col-md-6'>
                  <BookCard
                    book={book}
                    onEdit={handleEditBook}
                    currentUserId={userData?.id}
                    showEditForOwn={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            renderEmptyState('ph ph-books', tProfile("noBooksTitle"), tProfile("noBooksSubtitle"))
          )}
        </div>
      );
    }

    if (activeTab === 'archive') {
      return (
        <div className='p-32'>
          <div className='d-flex align-items-center gap-16 mb-24'>
            <h3 className='text-2xl fw-bold text-gray-900 mb-0'>{tProfile("archiveTitle")}</h3>
            <span className='badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs'>{tProfile("archiveBadge")}</span>
          </div>
          {booksLoading ? (
            <div className='text-center py-60'>
              <Spin text={tProfile("booksLoading")} />
            </div>
          ) : archivedBooks.length > 0 ? (
            <div className='row g-4'>
              {archivedBooks.map((book) => (
                <div key={book.id} className='col-lg-4 col-md-6'>
                  <BookCard
                    book={book}
                    onEdit={handleEditBook}
                    currentUserId={userData?.id}
                    showEditForOwn={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            renderEmptyState('ph ph-archive', tProfile("noArchiveTitle"), tProfile("noArchiveSubtitle"))
          )}
        </div>
      );
    }

    if (activeTab === 'posts') {
      return (
        <div className='p-32'>
          <div className='d-flex align-items-center justify-content-between mb-24'>
            <div className='d-flex align-items-center gap-16'>
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>{tProfile("myPosts")}</h3>
              <span className='badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs'>{tProfile("postsBadge")}</span>
            </div>
            <button
              className='btn btn-main py-8 px-16 text-sm'
              onClick={handleCreatePost}
            >
              <i className='ph ph-plus me-8'></i>
              {tProfile("addPost")}
            </button>
          </div>
          {postsLoading ? (
            <div className='text-center py-60'>
              <Spin text={tProfile("postsLoading")} />
            </div>
          ) : userPosts.length > 0 ? (
            <div className='row g-4'>
              {userPosts.map((post) => (
                <div key={post.id} className='col-lg-6 col-md-12'>
                  <PostCard post={post} onEdit={handleEditPost} />
                </div>
              ))}
            </div>
          ) : (
            renderEmptyState('ph ph-newspaper', tProfile("noPostsTitle"), tProfile("noPostsSubtitle"))
          )}
        </div>
      );
    }

    return (
      <div className='p-32'>
        <div className='d-flex align-items-center gap-16 mb-24'>
          <h3 className='text-2xl fw-bold text-gray-900 mb-0'>{tProfile("myBooks")}</h3>
          <span className='badge bg-main-100 text-main-600 px-12 py-4 rounded-pill text-xs'>{tProfile("activeBadge")}</span>
        </div>
        {renderEmptyState('ph ph-books', tProfile("noBooksTitle"), tProfile("noBooksSubtitle"))}
      </div>
    );
  };

  return (
    <section className='account py-60' style={{backgroundColor: '#f8f9fa'}}>
      <div className='container container-lg'>
        <div className='row g-4'>
          {/* User Info Section */}
          <div className='col-lg-4'>
            <div className='bg-white rounded-16 shadow-sm border border-gray-100 overflow-hidden'>
              <div className='p-32'>
                {/* User Avatar */}
                <div className='text-center mb-24'>
                  <div className='position-relative d-inline-block'>
                    <img 
                      src={userData?.picture || '/assets/images/thumbs/user-placeholder.png'} 
                      alt={userData?.first_name || 'User'}
                      className='rounded-circle'
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/assets/images/thumbs/user-placeholder.png';
                      }}
                    />
                    <button
                      className='btn btn-sm btn-main rounded-circle position-absolute bottom-0 end-0 p-8'
                      type='button'
                      aria-label={tProfile("cameraButton")}
                      title={tProfile("cameraButton")}
                      onClick={handleAvatarButtonClick}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? (
                        <span className='spinner-border spinner-border-sm text-white' role='status' aria-hidden='true'></span>
                      ) : (
                        <i className='ph ph-camera text-white'></i>
                      )}
                    </button>
                    <input
                      type='file'
                      accept='image/*'
                      ref={fileInputRef}
                      className='d-none'
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>

                {/* User Name */}
                <div className='text-center mb-24'>
                  <h4 className='text-xl fw-bold text-gray-900 mb-4'>
                    {isEditingProfile ? (
                      <div className='d-flex gap-8 justify-content-center'>
                        <input
                          type='text'
                          name='first_name'
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.first_name || ''}
                          onChange={handleProfileInputChange}
                          placeholder={tProfileForm('enterFirstName')}
                          disabled={!isEditingProfile}
                          style={{ width: '120px' }}
                        />
                        <input
                          type='text'
                          name='last_name'
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.last_name || ''}
                          onChange={handleProfileInputChange}
                          placeholder={tProfileForm('enterLastName')}
                          disabled={!isEditingProfile}
                          style={{ width: '120px' }}
                        />
                      </div>
                    ) : (
                      (() => {
                        const parts = [userData?.first_name, userData?.last_name].filter(Boolean);
                        return parts.length ? parts.join(' ') : tProfileForm('notProvided');
                      })()
                    )}
                  </h4>
                  <p className='text-gray-500 text-sm mb-0'>
                    {userData?.user_type === 'bookshop' ? tProfile('bookshopOwner') : tProfile('user')}
                  </p>
                </div>

                {/* User Stats */}
                <div className='row g-3 mb-24'>
                  <div className='col-4 text-center'>
                    <div className='bg-gray-50 rounded-12 p-16'>
                      <h5 className='text-lg fw-bold text-gray-900 mb-2'>{userBooks.length}</h5>
                      <p className='text-xs text-gray-500 mb-0'>{tProfile("statsBooks")}</p>
                    </div>
                  </div>
                  <div className='col-4 text-center'>
                    <div className='bg-gray-50 rounded-12 p-16'>
                      <h5 className='text-lg fw-bold text-gray-900 mb-2'>{archivedBooks.length}</h5>
                      <p className='text-xs text-gray-500 mb-0'>{tProfile("statsArchive")}</p>
                    </div>
                  </div>
                  <div className='col-4 text-center'>
                    <div className='bg-gray-50 rounded-12 p-16'>
                      <h5 className='text-lg fw-bold text-gray-900 mb-2'>{userPosts.length}</h5>
                      <p className='text-xs text-gray-500 mb-0'>{tProfile("statsPosts")}</p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className='mb-24'>
                  <h6 className='text-sm fw-semibold text-gray-700 mb-12'>{tProfile("infoTitle")}</h6>
                  <div className='space-y-8'>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>{`${tProfile("phone")}:`}</span>
                      {isEditingProfile ? (
                        <input
                          type='tel'
                          name='app_phone_number'
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.app_phone_number || ''}
                          onChange={handleProfileInputChange}
                          placeholder={tProfile("phonePlaceholder")}
                          disabled={!isEditingProfile}
                          style={{ width: '150px' }}
                        />
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{userData?.app_phone_number || tProfile("notProvided")}</span>
                      )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>{`${tProfile("region")}:`}</span>
                      {isEditingProfile ? (
                        <select
                          name='region'
                          className={`form-select form-select-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.region || ''}
                          onChange={handleProfileInputChange}
                          disabled={regionsLoading}
                          style={{ width: '150px' }}
                        >
                          <option value=''>
                            {regionsLoading ? tProfile("loadingData") : tLocation("selectRegion")}
                          </option>
                          {regions.map(region => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{getRegionDisplayName() || tProfile("notProvided")}</span>
                      )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>{`${tProfile("district")}:`}</span>
                      {isEditingProfile ? (
                        <select
                          name='district'
                          className={`form-select form-select-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.district || ''}
                          onChange={handleProfileInputChange}
                          disabled={!profileFormData.region || districtOptions.length === 0}
                          style={{ width: '150px' }}
                        >
                          <option value=''>
                            {!profileFormData.region
                              ? tLocation("selectRegion")
                              : districtOptions.length === 0
                                ? tLocation("noDistricts")
                                : tLocation("selectDistrict")}
                          </option>
                          {districtOptions.map(district => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{getDistrictDisplayName() || tProfile("notProvided")}</span>
                      )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>{`${tProfile("location")}:`}</span>
                      {isEditingProfile ? (
                        <input
                          type='text'
                          name='location_text'
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.location_text || ''}
                          onChange={handleProfileInputChange}
                          placeholder={tProfileForm("enterFullAddress")}
                          disabled={!isEditingProfile}
                          style={{ width: '150px' }}
                        />
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{userData?.location_text || tProfileForm("noLocation")}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className='mb-24'>
                  <h6 className='text-sm fw-semibold text-gray-700 mb-12'>{tProfile("bioTitle")}</h6>
                  {isEditingProfile ? (
                    <textarea
                      name='bio'
                      className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                      value={profileFormData.bio || ''}
                      onChange={handleProfileInputChange}
                      placeholder={tProfileForm("tellAboutYourself")}
                      disabled={!isEditingProfile}
                      rows='3'
                    />
                  ) : (
                    <p className='text-sm text-gray-600 mb-0'>{userData?.bio || tProfile("bioEmpty")}</p>
                  )}
                </div>

                {/* Edit Profile Button */}
                {!isEditingProfile ? (
                  <div className='d-flex flex-column gap-8'>
                    <button
                      className='btn btn-outline-main w-100 py-12'
                      onClick={handleEditProfile}
                    >
                      <i className='ph ph-pencil me-8'></i>
                      {tProfile("editProfile")}
                    </button>
                    <button
                      className='btn btn-outline-danger w-100 py-12'
                      onClick={logout}
                    >
                      <i className='ph ph-sign-out me-8'></i>
                      {tProfile("logout")}
                    </button>
                  </div>
                ) : (
                  <div className='d-flex gap-8'>
                    <button
                      className='btn btn-main flex-fill py-12'
                      onClick={handleSaveProfile}
                      disabled={!hasChanges || saving}
                    >
                      {saving ? (
                        <>
                          <Spin size='sm' text={tProfile("saving") || ""} />
                          {tProfile("saving")}
                        </>
                      ) : (
                        <>
                          <i className='ph ph-check me-8'></i>
                          {tProfile("save")}
                        </>
                      )}
                    </button>
                    <button
                      className='btn btn-outline-secondary py-12'
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <i className='ph ph-x me-8'></i>
                      {tProfile("cancel")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className='col-lg-8'>
            <div className='bg-white rounded-16 shadow-sm border border-gray-100 overflow-hidden'>
              {/* Tab Navigation */}
              <div className='border-bottom border-gray-100'>
                <nav className='nav nav-tabs nav-tabs-custom'>
                  <button 
                    className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}
                    onClick={() => setActiveTab('books')}
                  >
                    <i className='ph ph-books me-8'></i>
                    {tProfile("booksTab")}
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'archive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('archive')}
                  >
                    <i className='ph ph-archive me-8'></i>
                    {tProfile("archiveTab")}
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                  >
                    <i className='ph ph-newspaper me-8'></i>
                    {tProfile("postsTab")}
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div>
                {renderContent()}
              </div>
            </div>
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
      
      {/* Post Create/Edit Modal */}
      <PostCreateModal
        isOpen={showPostModal}
        onClose={handleClosePostModal}
        onSuccess={handlePostSuccess}
        editPost={editingPost}
      />

      <style jsx>{`
        .form-control.disabled,
        .form-select.disabled {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
        }

        .form-control.editable,
        .form-select.editable {
          background-color: #ffffff;
          border: 1px solid #ced4da;
          color: #212529;
        }

        .form-control.editable:focus,
        .form-select.editable:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }

        .form-control.disabled::placeholder,
        .form-select.disabled::placeholder {
          color: #adb5bd;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-border-sm {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }
      `}</style>
    </section>
  );
};

export default ProfileDashboard;
