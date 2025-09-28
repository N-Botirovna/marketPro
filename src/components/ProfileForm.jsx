"use client";

import React from 'react';

const ProfileForm = ({ userData, formData, isEditing, onInputChange, onSave }) => {
  return (
    <div className="px-24">
      {/* Profile Form Section */}
      <div className="row g-3 mb-32">
        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">First Name</label>
            {isEditing ? (
              <input 
                type="text" 
                name="first_name"
                className="form-control py-10 px-12 border border-gray-200 rounded-8" 
                value={formData.first_name}
                onChange={onInputChange}
                placeholder="Enter first name"
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.first_name || 'Not provided'}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">Last Name</label>
            {isEditing ? (
              <input 
                type="text" 
                name="last_name"
                className="form-control py-10 px-12 border border-gray-200 rounded-8" 
                value={formData.last_name}
                onChange={onInputChange}
                placeholder="Enter last name"
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.last_name || 'Not provided'}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">User Type</label>
            <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
              {userData?.user_type || 'Not specified'}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">Region</label>
            {isEditing ? (
              <input 
                type="text" 
                name="region"
                className="form-control py-10 px-12 border border-gray-200 rounded-8" 
                value={formData.region}
                onChange={onInputChange}
                placeholder="Enter region"
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.region || 'Not specified'}
              </div>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">Bio</label>
            {isEditing ? (
              <textarea 
                name="bio"
                className="form-control py-10 px-12 border border-gray-200 rounded-8" 
                rows="3"
                value={formData.bio}
                onChange={onInputChange}
                placeholder="Tell us about yourself..."
              ></textarea>
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700 min-h-80">
                {formData.bio || 'No bio provided'}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">District</label>
            {isEditing ? (
              <input 
                type="text" 
                name="district"
                className="form-control py-10 px-12 border border-gray-200 rounded-8" 
                value={formData.district}
                onChange={onInputChange}
                placeholder="Enter district"
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.district || 'Not specified'}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">Location</label>
            {isEditing ? (
              <input 
                type="text" 
                name="location_text"
                className="form-control py-10 px-12 border border-gray-200 rounded-8" 
                value={formData.location_text}
                onChange={onInputChange}
                placeholder="Enter your full address..."
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.location_text || 'No location provided'}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mb-32 d-flex gap-12">
          <button 
            onClick={onSave}
            className="btn btn-main py-10 px-24 text-sm fw-medium"
          >
            <i className="ph ph-check me-2"></i>
            Save Changes
          </button>
          <button 
            onClick={() => onInputChange({ target: { name: 'isEditing', value: false } })}
            className="btn btn-outline-secondary py-10 px-24 text-sm fw-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
