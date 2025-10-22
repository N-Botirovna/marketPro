// Example component showing how to use the API responses
import React, { useState, useEffect } from 'react';
import UserProfile from '@/components/UserProfile';
import { handleUserProfileResponse } from '@/utils/apiResponse';
import Spin from '@/components/Spin';

const UserProfileExample = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with your actual data
    const simulateApiCall = async () => {
      setLoading(true);
      
      // This is the actual response from your /me endpoint
      const userProfileResponse = {
        data: {
          "id": 9,
          "bio": null,
          "app_phone_number": null,
          "role": "simple",
          "first_name": "Nargiza",
          "last_name": "",
          "picture": "http://api.kitobzor.uz/media/users/pictures/default_user.png",
          "region": null,
          "district": null,
          "point": null,
          "location_text": null,
          "user_type": "bookshop"
        }
      };

      // Process the response using our utility function
      const processedUserData = handleUserProfileResponse(userProfileResponse);
      setUserData(processedUserData);
      
      setLoading(false);
    };

    simulateApiCall();
  }, []);

  if (loading) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <Spin text="Loading user profile..." />
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
      <UserProfile userData={userData} />
    </div>
  );
};

export default UserProfileExample;
