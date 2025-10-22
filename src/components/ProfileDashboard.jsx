"use client";

import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { getUserPostedBooks, getUserArchivedBooks } from '@/services/books';
import { getUserPosts } from '@/services/posts';
import http from '@/lib/http';
import { API_ENDPOINTS } from '@/config';
import BookCard from './BookCard';
import Spin from './Spin';
import BookCreateModal from './BookCreateModal';
import PostCard from './PostCard';
import PostCreateModal from './PostCreateModal';

const ProfileDashboard = () => {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setProfileFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      app_phone_number: user?.app_phone_number || '',
      bio: user?.bio || '',
      region: user?.region || '',
      district: user?.district || '',
      location_text: user?.location_text || '',
    });
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check if there are changes
    const originalValue = userData?.[name] || '';
    const hasChanges = Object.keys(profileFormData).some(key => {
      if (key === name) return value !== originalValue;
      return profileFormData[key] !== (userData?.[key] || '');
    });
    setHasChanges(hasChanges || value !== originalValue);
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    initializeProfileForm(userData);
    setHasChanges(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileFormData({});
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
        region: profileFormData.region,
        district: profileFormData.district,
        location_text: profileFormData.location_text,
      };

      // Remove empty/null values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== null && value !== '')
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
        // Update local user data
        setUserData(prev => ({
          ...prev,
          ...cleanedData
        }));
        setIsEditingProfile(false);
        setHasChanges(false);
        
        // Show success message
        alert('Profil muvaffaqiyatli yangilandi!');
      } else {
        console.error('❌ Failed to update profile:', data?.message || 'Unknown error');
        alert('Profilni yangilashda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } catch (error) {
      console.error('💥 Error updating profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      alert('Profilni yangilashda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (!authLoading) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
      return;
    }

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

  if (loading) {
    return (
      <section className='account py-80'>
        <div className='container container-lg'>
          <div className='d-flex justify-content-center align-items-center py-80'>
            <Spin text="Ma'lumotlar yuklanmoqda..." />
          </div>
        </div>
      </section>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'books':
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center justify-content-between mb-24">
              <div className="d-flex align-items-center gap-16">
                <h3 className='text-2xl fw-bold text-gray-900 mb-0'>My Books</h3>
                <span className="badge bg-main-100 text-main-600 px-12 py-4 rounded-pill text-xs">Active Books</span>
              </div>
              <button 
                className="btn btn-main py-8 px-16 text-sm"
                onClick={handleCreateBook}
              >
                <i className="ph ph-plus me-8"></i>
                Kitob qo'shish
              </button>
            </div>
            {booksLoading ? (
              <div className='text-center py-60'>
                <Spin text="Kitoblar yuklanmoqda..." />
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
              <div className='text-center py-60'>
                <i className='ph ph-books text-gray-300 text-5xl mb-16'></i>
                <h5 className='text-gray-500 mb-0'>No books posted yet</h5>
                <p className='text-gray-400 text-sm mt-8'>Your posted books will appear here</p>
              </div>
            )}
          </div>
        );
      case 'archive':
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center gap-16 mb-24">
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>Archive Books</h3>
              <span className="badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs">Archived</span>
            </div>
            {booksLoading ? (
              <div className='text-center py-60'>
                <Spin text="Kitoblar yuklanmoqda..." />
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
              <div className='text-center py-60'>
                <i className='ph ph-archive text-gray-300 text-5xl mb-16'></i>
                <h5 className='text-gray-500 mb-0'>No archived books</h5>
                <p className='text-gray-400 text-sm mt-8'>Your archived books will appear here</p>
              </div>
            )}
          </div>
        );
      case 'posts':
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center justify-content-between mb-24">
              <div className="d-flex align-items-center gap-16">
                <h3 className='text-2xl fw-bold text-gray-900 mb-0'>My Posts</h3>
                <span className="badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs">All Posts</span>
              </div>
              <button 
                className="btn btn-main py-8 px-16 text-sm"
                onClick={handleCreatePost}
              >
                <i className="ph ph-plus me-8"></i>
                Post qo'shish
              </button>
            </div>
            {postsLoading ? (
              <div className='text-center py-60'>
                <Spin text="Kitoblar yuklanmoqda..." />
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
              <div className='text-center py-60'>
                <i className='ph ph-newspaper text-gray-300 text-5xl mb-16'></i>
                <h5 className='text-gray-500 mb-0'>No posts yet</h5>
                <p className='text-gray-400 text-sm mt-8'>Your posts will appear here</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center gap-16 mb-24">
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>My Books</h3>
              <span className="badge bg-main-100 text-main-600 px-12 py-4 rounded-pill text-xs">Active Books</span>
            </div>
            <div className='text-center py-60'>
              <i className='ph ph-books text-gray-300 text-5xl mb-16'></i>
              <h5 className='text-gray-500 mb-0'>No books posted yet</h5>
              <p className='text-gray-400 text-sm mt-8'>Your posted books will appear here</p>
            </div>
          </div>
        );
    }
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
                    <button className='btn btn-sm btn-main rounded-circle position-absolute bottom-0 end-0 p-8'>
                      <i className='ph ph-camera text-white'></i>
                    </button>
                  </div>
                </div>

                {/* User Name */}
                <div className='text-center mb-24'>
                  <h4 className='text-xl fw-bold text-gray-900 mb-4'>
                    {isEditingProfile ? (
                      <div className="d-flex gap-8 justify-content-center">
                        <input 
                          type="text" 
                          name="first_name"
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.first_name || ''}
                          onChange={handleProfileInputChange}
                          placeholder="Ism"
                          disabled={!isEditingProfile}
                          style={{ width: '120px' }}
                        />
                        <input 
                          type="text" 
                          name="last_name"
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.last_name || ''}
                          onChange={handleProfileInputChange}
                          placeholder="Familiya"
                          disabled={!isEditingProfile}
                          style={{ width: '120px' }}
                        />
                      </div>
                    ) : (
                      `${userData?.first_name || 'Noma\'lum'} ${userData?.last_name || ''}`
                    )}
                  </h4>
                  <p className='text-gray-500 text-sm mb-0'>
                    {userData?.user_type === 'bookshop' ? 'Kitob do\'koni egasi' : 'Foydalanuvchi'}
                  </p>
                </div>

                {/* User Stats */}
                <div className='row g-3 mb-24'>
                  <div className='col-4 text-center'>
                    <div className='bg-gray-50 rounded-12 p-16'>
                      <h5 className='text-lg fw-bold text-gray-900 mb-2'>{userBooks.length}</h5>
                      <p className='text-xs text-gray-500 mb-0'>Kitoblar</p>
                    </div>
                  </div>
                  <div className='col-4 text-center'>
                    <div className='bg-gray-50 rounded-12 p-16'>
                      <h5 className='text-lg fw-bold text-gray-900 mb-2'>{archivedBooks.length}</h5>
                      <p className='text-xs text-gray-500 mb-0'>Arxiv</p>
                    </div>
                  </div>
                  <div className='col-4 text-center'>
                    <div className='bg-gray-50 rounded-12 p-16'>
                      <h5 className='text-lg fw-bold text-gray-900 mb-2'>{userPosts.length}</h5>
                      <p className='text-xs text-gray-500 mb-0'>Postlar</p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className='mb-24'>
                  <h6 className='text-sm fw-semibold text-gray-700 mb-12'>Ma'lumotlar</h6>
                  <div className='space-y-8'>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>Telefon:</span>
                      {isEditingProfile ? (
                        <input 
                          type="tel" 
                          name="app_phone_number"
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.app_phone_number || ''}
                          onChange={handleProfileInputChange}
                          placeholder="Telefon raqam"
                          disabled={!isEditingProfile}
                          style={{ width: '150px' }}
                        />
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{userData?.app_phone_number || 'Ko\'rsatilmagan'}</span>
                      )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>Viloyat:</span>
                      {isEditingProfile ? (
                        <input 
                          type="text" 
                          name="region"
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.region || ''}
                          onChange={handleProfileInputChange}
                          placeholder="Viloyat"
                          disabled={!isEditingProfile}
                          style={{ width: '150px' }}
                        />
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{userData?.region || 'Ko\'rsatilmagan'}</span>
                      )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>Tuman:</span>
                      {isEditingProfile ? (
                        <input 
                          type="text" 
                          name="district"
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.district || ''}
                          onChange={handleProfileInputChange}
                          placeholder="Tuman"
                          disabled={!isEditingProfile}
                          style={{ width: '150px' }}
                        />
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{userData?.district || 'Ko\'rsatilmagan'}</span>
                      )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center py-8'>
                      <span className='text-sm text-gray-600'>Manzil:</span>
                      {isEditingProfile ? (
                        <input 
                          type="text" 
                          name="location_text"
                          className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                          value={profileFormData.location_text || ''}
                          onChange={handleProfileInputChange}
                          placeholder="To'liq manzil"
                          disabled={!isEditingProfile}
                          style={{ width: '150px' }}
                        />
                      ) : (
                        <span className='text-sm fw-medium text-gray-900'>{userData?.location_text || 'Ko\'rsatilmagan'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className='mb-24'>
                  <h6 className='text-sm fw-semibold text-gray-700 mb-12'>Bio</h6>
                  {isEditingProfile ? (
                    <textarea 
                      name="bio"
                      className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                      value={profileFormData.bio || ''}
                      onChange={handleProfileInputChange}
                      placeholder="O'zingiz haqingizda yozing..."
                      disabled={!isEditingProfile}
                      rows="3"
                    />
                  ) : (
                    <p className='text-sm text-gray-600 mb-0'>{userData?.bio || 'Bio kiritilmagan'}</p>
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
                      Profilni tahrirlash
                    </button>
                    <button 
                      className='btn btn-outline-danger w-100 py-12'
                      onClick={logout}
                    >
                      <i className='ph ph-sign-out me-8'></i>
                      Chiqish
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
                          <Spin size="sm" text="Saqlanmoqda..." />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <i className='ph ph-check me-8'></i>
                          Saqlash
                        </>
                      )}
                    </button>
                    <button 
                      className='btn btn-outline-secondary py-12'
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <i className='ph ph-x me-8'></i>
                      Bekor qilish
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
                    Kitoblar
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'archive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('archive')}
                  >
                    <i className='ph ph-archive me-8'></i>
                    Arxiv
                  </button>
                  <button 
                    className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                  >
                    <i className='ph ph-newspaper me-8'></i>
                    Postlar
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
        .form-control.disabled {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
        }

        .form-control.editable {
          background-color: #ffffff;
          border: 1px solid #ced4da;
          color: #212529;
        }

        .form-control.editable:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }

        .form-control.disabled::placeholder {
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
