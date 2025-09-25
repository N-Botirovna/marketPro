"use client";

import React, { useState, useEffect } from 'react';
import { getUserPostedBooks } from '@/services/books';

const UserProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    app_phone_number: userData?.app_phone_number || '',
    bio: userData?.bio || '',
    region: userData?.region || '',
    district: userData?.district || '',
    location_text: userData?.location_text || '',
  });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  // Fetch user's posted books
  useEffect(() => {
    const fetchUserBooks = async () => {
      if (userData?.id) {
        try {
          setBooksLoading(true);
          const response = await getUserPostedBooks(userData.id, 6);
          setUserBooks(response.books || []);
        } catch (error) {
          console.error('Error fetching user books:', error);
        } finally {
          setBooksLoading(false);
        }
      }
    };

    fetchUserBooks();
  }, [userData?.id]);

    return (
        <div className="p-32">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-32">
                <div>
                    <h3 className="text-2xl fw-bold text-gray-900 mb-0">Profile Information</h3>
                    <p className="text-gray-500 text-sm mt-4 mb-0">Manage your account settings and profile information</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-main py-10 px-24 text-sm fw-medium"
                >
                    <i className="ph ph-pencil me-2"></i>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="row g-5">
                {/* Profile Picture Section */}
                <div className="col-lg-4">
                    <div className="text-center">
                        <div className="position-relative d-inline-block mb-24">
                            <img
                                src={userData?.picture || '/assets/images/icon/user-avatar.png'}
                                alt="Profile"
                                className="rounded-circle border-3 border-white shadow-sm"
                                style={{ width: '140px', height: '140px', objectFit: 'cover' }}
                            />
                            {isEditing && (
                                <button className="btn btn-main rounded-circle position-absolute top-0 end-0 shadow-sm" style={{ width: '36px', height: '36px' }}>
                                    <i className="ph ph-camera text-white text-sm"></i>
                                </button>
                            )}
                        </div>
                        <h4 className="text-xl fw-bold text-gray-900 mb-8">
                            {userData?.first_name} {userData?.last_name}
                        </h4>
                        <span className="badge bg-main-600 text-white px-16 py-6 rounded-pill text-sm fw-medium mb-16 d-inline-block">
                            {userData?.role === 'superadmin' ? 'Super Admin' :
                                userData?.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                        <div className="d-flex flex-column gap-8">
                            <div className="d-flex align-items-center justify-content-center gap-8">
                                <i className="ph ph-phone text-gray-500 text-sm"></i>
                                <span className="text-gray-700 text-sm">{userData?.app_phone_number}</span>
                            </div>
                            {userData?.location_text && (
                                <div className="d-flex align-items-center justify-content-center gap-8">
                                    <i className="ph ph-map-pin text-gray-500 text-sm"></i>
                                    <span className="text-gray-700 text-sm">{userData?.location_text}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Form Section */}
                <div className="col-lg-8">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-control py-8 px-16 border border-gray-200 rounded-8"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                    />
                                ) : (
                                      <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                        {formData.first_name || 'Not provided'}
                                      </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-control py-12 px-16 border border-gray-200 rounded-8"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                    />
                                ) : (
                                    <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                        {formData.last_name || 'Not provided'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="app_phone_number"
                                        className="form-control py-12 px-16 border border-gray-200 rounded-8"
                                        value={formData.app_phone_number}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                        {formData.app_phone_number || 'Not provided'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">User Type</label>
                                <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                    {userData?.user_type || 'Not specified'}
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        className="form-control py-12 px-16 border border-gray-200 rounded-8"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Tell us about yourself..."
                                    ></textarea>
                                ) : (
                                    <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700 min-h-100">
                                        {formData.bio || 'No bio provided'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">Region</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="region"
                                        className="form-control py-12 px-16 border border-gray-200 rounded-8"
                                        value={formData.region}
                                        onChange={handleInputChange}
                                        placeholder="Enter region"
                                    />
                                ) : (
                                    <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                        {formData.region || 'Not specified'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">District</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="district"
                                        className="form-control py-6 px-16 border border-gray-200 rounded-8"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder="Enter district"
                                    />
                                ) : (
                                    <div className="py-8 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                        {formData.district || 'Not specified'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="mb-20">
                                <label className="text-gray-900 text-sm fw-semibold mb-8 d-block">Location</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location_text"
                                        className="form-control py-12 px-16 border border-gray-200 rounded-8"
                                        value={formData.location_text}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full address..."
                                    />
                                ) : (
                                    <div className="py-6 px-16 border shadow-xs border-gray-100 rounded-8 text-gray-700">
                                        {formData.location_text || 'No location provided'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

          {isEditing && (
            <div className="mt-32 d-flex gap-16">
              <button 
                onClick={handleSave}
                className="btn btn-main py-12 px-32 text-sm fw-medium"
              >
                <i className="ph ph-check me-2"></i>
                Save Changes
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="btn btn-outline-secondary py-12 px-32 text-sm fw-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User's Posted Books Section */}
      <div className="mt-48">
        <div className="d-flex justify-content-between align-items-center mb-24">
          <h4 className="text-xl fw-bold text-gray-900 mb-0">My Posted Books</h4>
          <span className="badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs">
            {userBooks.length} books
          </span>
        </div>
        
        {booksLoading ? (
          <div className="text-center py-40">
            <div className="spinner-border text-main-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-gray-500 mt-16 mb-0">Loading your books...</p>
          </div>
        ) : userBooks.length > 0 ? (
          <div className="row g-3">
            {userBooks.map((book, index) => (
              <div key={book.id || index} className="col-md-4 col-sm-6">
                <div className="border border-gray-200 rounded-12 p-16 hover-shadow-sm transition-1">
                  <div className="d-flex gap-12">
                    <img 
                      src={book.cover_image || '/assets/images/icon/book-placeholder.png'} 
                      alt={book.title}
                      className="rounded-8"
                      style={{width: '60px', height: '80px', objectFit: 'cover'}}
                    />
                    <div className="flex-grow-1">
                      <h6 className="text-sm fw-semibold text-gray-900 mb-4 line-clamp-2">
                        {book.title}
                      </h6>
                      <p className="text-xs text-gray-500 mb-8">
                        {book.author || 'Unknown Author'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-sm fw-bold text-main-600">
                          {book.price ? `${book.price} UZS` : 'Free'}
                        </span>
                        <span className={`badge px-8 py-2 rounded-pill text-xs ${
                          book.is_used ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {book.is_used ? 'Used' : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
            <i className="ph ph-book text-gray-300 text-4xl mb-16"></i>
            <h5 className="text-gray-500 mb-8">No books posted yet</h5>
            <p className="text-gray-400 text-sm">Start sharing your books with the community</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;