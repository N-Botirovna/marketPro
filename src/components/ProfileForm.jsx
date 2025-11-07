"use client";

import React from 'react';
import { useTranslations } from "next-intl";

const ProfileForm = ({ userData, formData, isEditing, onInputChange, onSave, onCancel }) => {
  const tForm = useTranslations("ProfileForm");

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onInputChange) {
      onInputChange({ target: { name: 'isEditing', value: false } });
    }
  };

  return (
    <div className="px-24">
      {/* Profile Form Section */}
      <div className="row g-3 mb-32">
        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("firstName")}</label>
            {isEditing ? (
              <input
                type="text"
                name="first_name"
                className="form-control py-10 px-12 border border-gray-200 rounded-8"
                value={formData.first_name}
                onChange={onInputChange}
                placeholder={tForm("enterFirstName")}
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.first_name || tForm("notProvided")}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("lastName")}</label>
            {isEditing ? (
              <input
                type="text"
                name="last_name"
                className="form-control py-10 px-12 border border-gray-200 rounded-8"
                value={formData.last_name}
                onChange={onInputChange}
                placeholder={tForm("enterLastName")}
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.last_name || tForm("notProvided")}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("userType")}</label>
            <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
              {userData?.user_type || tForm("notSpecified")}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("region")}</label>
            {isEditing ? (
              <input
                type="text"
                name="region"
                className="form-control py-10 px-12 border border-gray-200 rounded-8"
                value={formData.region}
                onChange={onInputChange}
                placeholder={tForm("enterRegion")}
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.region || tForm("notSpecified")}
              </div>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("bio")}</label>
            {isEditing ? (
              <textarea
                name="bio"
                className="form-control py-10 px-12 border border-gray-200 rounded-8"
                rows="3"
                value={formData.bio}
                onChange={onInputChange}
                placeholder={tForm("tellAboutYourself")}
              ></textarea>
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700 min-h-80">
                {formData.bio || tForm("noBio")}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("district")}</label>
            {isEditing ? (
              <input
                type="text"
                name="district"
                className="form-control py-10 px-12 border border-gray-200 rounded-8"
                value={formData.district}
                onChange={onInputChange}
                placeholder={tForm("enterDistrict")}
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.district || tForm("notSpecified")}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-16">
            <label className="text-gray-900 text-sm fw-semibold mb-6 d-block">{tForm("location")}</label>
            {isEditing ? (
              <input
                type="text"
                name="location_text"
                className="form-control py-10 px-12 border border-gray-200 rounded-8"
                value={formData.location_text}
                onChange={onInputChange}
                placeholder={tForm("enterFullAddress")}
              />
            ) : (
              <div className="py-10 px-12 border border-gray-200 rounded-8 bg-gray-50 text-gray-700">
                {formData.location_text || tForm("noLocation")}
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
            {tForm("saveChanges")}
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-outline-secondary py-10 px-24 text-sm fw-medium"
          >
            {tForm("cancel")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
