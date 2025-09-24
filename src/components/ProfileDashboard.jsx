"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';
import { getUserProfile } from '@/services/auth';

const ProfileDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response.user || response.raw);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <section className='account py-80'>
        <div className='container container-lg'>
          <div className='d-flex justify-content-center align-items-center py-80'>
            <div className='spinner-border text-main-600' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfile userData={userData} />;
      case 'orders':
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center gap-16 mb-24">
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>My Orders</h3>
              <span className="badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs">All Orders</span>
            </div>
            <div className='text-center py-60'>
              <i className='ph ph-shopping-cart text-gray-300 text-5xl mb-16'></i>
              <h5 className='text-gray-500 mb-0'>No orders found</h5>
              <p className='text-gray-400 text-sm mt-8'>Your orders will appear here</p>
            </div>
          </div>
        );
      case 'wishlist':
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center gap-16 mb-24">
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>My Wishlist</h3>
              <span className="badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs">All Items</span>
            </div>
            <div className='text-center py-60'>
              <i className='ph ph-heart text-gray-300 text-5xl mb-16'></i>
              <h5 className='text-gray-500 mb-0'>No items in wishlist</h5>
              <p className='text-gray-400 text-sm mt-8'>Items you like will appear here</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className='p-32'>
            <div className="d-flex align-items-center gap-16 mb-24">
              <h3 className='text-2xl fw-bold text-gray-900 mb-0'>Settings</h3>
              <span className="badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs">Account</span>
            </div>
            <div className='text-center py-60'>
              <i className='ph ph-gear text-gray-300 text-5xl mb-16'></i>
              <h5 className='text-gray-500 mb-0'>Settings panel coming soon</h5>
              <p className='text-gray-400 text-sm mt-8'>Manage your account settings here</p>
            </div>
          </div>
        );
      default:
        return <UserProfile userData={userData} />;
    }
  };

  return (
    <section className='account py-60' style={{backgroundColor: '#f8f9fa'}}>
      <div className='container container-lg'>
        <div className='row g-4'>
          {/* Sidebar */}
          <div className='col-lg-3'>
            <div className='bg-white rounded-16 shadow-sm border border-gray-100 overflow-hidden'>
              <Sidebar 
                role={userData?.role || 'user'} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userData={userData}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className='col-lg-9'>
            <div className='bg-white rounded-16 shadow-sm border border-gray-100 overflow-hidden'>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileDashboard;
