"use client";

import React, { useState, useEffect } from 'react';
import { getUserPostedBooks, getUserArchivedBooks } from '@/services/books';
import ProfileForm from './ProfileForm';

const UserProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [archivedLoading, setArchivedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Fetch user's posted books
  useEffect(() => {
    const fetchUserBooks = async () => {
      if (userData?.id) {
        try {
          setBooksLoading(true);
          setArchivedLoading(true);
          
          // Fetch active books
          const activeResponse = await getUserPostedBooks(userData.id, 6);
          setUserBooks(activeResponse.books || []);
          
          // Fetch archived books
          const archivedResponse = await getUserArchivedBooks(userData.id, 6);
          setArchivedBooks(archivedResponse.books || []);
        } catch (error) {
          console.error('Error fetching user books:', error);
        } finally {
          setBooksLoading(false);
          setArchivedLoading(false);
        }
      }
    };

    fetchUserBooks();
  }, [userData?.id]);

  return (
    <div>
      {/* <ProfileHeader 
        userData={userData}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
      /> */}
      
      <div className="row g-5">
        <ProfileForm 
          userData={userData}
          formData={formData}
          isEditing={isEditing}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
{/*       
      <BooksTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userBooks={userBooks}
        archivedBooks={archivedBooks}
        booksLoading={booksLoading}
        archivedLoading={archivedLoading}
      /> */}
    </div>
  );
};

export default UserProfile;