"use client";

import React from 'react';

const Sidebar = ({ role, activeTab, onTabChange, userData }) => {
  const menuItems = {
    superadmin: [
      { id: 'profile', icon: 'ph-user', text: 'Profile' },
      { id: 'users', icon: 'ph-users', text: 'Users' },
      { id: 'orders', icon: 'ph-shopping-cart', text: 'Orders' },
      { id: 'settings', icon: 'ph-gear', text: 'Settings' },
    ],
    admin: [
      { id: 'profile', icon: 'ph-user', text: 'Profile' },
      { id: 'orders', icon: 'ph-shopping-cart', text: 'Orders' },
      { id: 'settings', icon: 'ph-gear', text: 'Settings' },
    ],
    user: [
      { id: 'profile', icon: 'ph-user', text: 'Profile' },
      { id: 'orders', icon: 'ph-shopping-cart', text: 'My Orders' },
      { id: 'wishlist', icon: 'ph-heart', text: 'Wishlist' },
    ]
  };

  return (
    <div className="p-0">
      {/* User Info Section */}
      <div className="p-24 border-bottom border-gray-200">
        <div className="d-flex align-items-center gap-12 mb-16">
          <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" 
               style={{width: '40px', height: '40px', fontSize: '14px'}}>
            {userData?.first_name?.charAt(0) || 'U'}{userData?.last_name?.charAt(0) || 'S'}
          </div>
          <div className="flex-grow-1">
            <h6 className="text-sm fw-semibold text-gray-900 mb-0">
              {userData?.first_name} {userData?.last_name}
            </h6>
            <p className="text-xs text-gray-500 mb-0">
              {userData?.app_phone_number}
            </p>
          </div>
          <i className="ph ph-caret-down text-gray-400 text-sm"></i>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="p-24">
        <h6 className="text-xs fw-semibold text-gray-500 mb-16 text-uppercase">Navigate</h6>
        <div className="d-flex flex-column gap-1">
          {menuItems[role]?.map((item, index) => (
            <button
              key={index}
              onClick={() => onTabChange(item.id)}
              className={`text-start d-flex align-items-center justify-content-between py-10 px-12 rounded-6 transition-1 border-0 w-100 ${
                activeTab === item.id 
                  ? 'bg-main-600 text-white fw-semibold' 
                  : 'text-gray-700 hover-bg-gray-50 fw-medium'
              }`}
            >
              <div className="d-flex align-items-center gap-12">
                <i className={`${item.icon} text-sm`}></i>
                <span className="text-sm">{item.text}</span>
              </div>
              <i className="ph ph-caret-right text-xs"></i>
            </button>
          ))}
        </div>
      </div>

      {/* More Section */}
      <div className="p-24 border-top border-gray-200">
        <h6 className="text-xs fw-semibold text-gray-500 mb-16 text-uppercase">More</h6>
        <div className="d-flex flex-column gap-1">
          <button className="text-start d-flex align-items-center justify-content-between py-10 px-12 rounded-6 transition-1 border-0 w-100 text-gray-700 hover-bg-gray-50 fw-medium">
            <div className="d-flex align-items-center gap-12">
              <i className="ph ph-gear text-sm"></i>
              <span className="text-sm">Settings</span>
            </div>
            <i className="ph ph-caret-right text-xs"></i>
          </button>
          <button className="text-start d-flex align-items-center justify-content-between py-10 px-12 rounded-6 transition-1 border-0 w-100 text-gray-700 hover-bg-gray-50 fw-medium">
            <div className="d-flex align-items-center gap-12">
              <i className="ph ph-globe text-sm"></i>
              <span className="text-sm">Language</span>
            </div>
            <i className="ph ph-caret-right text-xs"></i>
          </button>
          <button className="text-start d-flex align-items-center justify-content-between py-10 px-12 rounded-6 transition-1 border-0 w-100 text-gray-700 hover-bg-gray-50 fw-medium">
            <div className="d-flex align-items-center gap-12">
              <i className="ph ph-moon text-sm"></i>
              <span className="text-sm">Night Mode</span>
            </div>
            <i className="ph ph-caret-right text-xs"></i>
          </button>
        </div>
      </div>

      {/* Links Section */}
      <div className="p-24 border-top border-gray-200">
        <div className="d-flex align-items-center gap-8 mb-12">
          <div className="bg-gray-200 rounded-circle" style={{width: '24px', height: '24px'}}></div>
          <div className="bg-gray-200 rounded-circle" style={{width: '24px', height: '24px'}}></div>
          <div className="bg-gray-200 rounded-circle" style={{width: '24px', height: '24px'}}></div>
        </div>
        <div className="d-flex align-items-center gap-12">
          <i className="ph ph-phone text-gray-400 text-sm"></i>
          <i className="ph ph-envelope text-gray-400 text-sm"></i>
          <i className="ph ph-chat-circle text-gray-400 text-sm"></i>
          <i className="ph ph-paper-plane text-gray-400 text-sm"></i>
          <i className="ph ph-whatsapp-logo text-gray-400 text-sm"></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;