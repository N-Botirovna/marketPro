// Example component showing how to use the update profile functionality
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '@/services/auth';
import UserProfile from '@/components/UserProfile';

const UpdateProfileExample = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        setUserData(response.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (updatedData) => {
    try {
      console.log('Profile updated:', updatedData);
      // You can refresh the user data here if needed
      const response = await getUserProfile();
      setUserData(response.user);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-gray-600 mt-16">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <p className="text-gray-600">Failed to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-32">
      <UserProfile 
        userData={userData} 
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default UpdateProfileExample;
