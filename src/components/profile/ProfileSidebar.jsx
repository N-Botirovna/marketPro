"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Spin from "@/components/Spin";

const ProfileSidebar = ({
  userData,
  userBooksCount,
  archivedBooksCount,
  isEditingProfile,
  profileFormData,
  regions,
  regionsLoading,
  districtOptions,
  hasChanges,
  saving,
  avatarUploading,
  fileInputRef,
  onAvatarButtonClick,
  onAvatarChange,
  onInputChange,
  onEditProfile,
  onCancelEdit,
  onSaveProfile,
  onLogout,
  regionDisplayName,
  districtDisplayName,
}) => {
  const tProfile = useTranslations("ProfileDashboard");
  const tProfileForm = useTranslations("ProfileForm");
  const tLocation = useTranslations("Location");

  return (
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
              onClick={onAvatarButtonClick}
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
              onChange={onAvatarChange}
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
                  onChange={onInputChange}
                  placeholder={tProfileForm('enterFirstName')}
                  disabled={!isEditingProfile}
                  style={{ width: '120px' }}
                />
                <input
                  type='text'
                  name='last_name'
                  className={`form-control form-control-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                  value={profileFormData.last_name || ''}
                  onChange={onInputChange}
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
          <div className='col-6 text-center'>
            <div className='bg-gray-50 rounded-12 p-16'>
              <h5 className='text-lg fw-bold text-gray-900 mb-2'>{userBooksCount}</h5>
              <p className='text-xs text-gray-500 mb-0'>{tProfile("statsBooks")}</p>
            </div>
          </div>
          <div className='col-6 text-center'>
            <div className='bg-gray-50 rounded-12 p-16'>
              <h5 className='text-lg fw-bold text-gray-900 mb-2'>{archivedBooksCount}</h5>
              <p className='text-xs text-gray-500 mb-0'>{tProfile("statsArchive")}</p>
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
                  onChange={onInputChange}
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
                  onChange={onInputChange}
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
                <span className='text-sm fw-medium text-gray-900'>{regionDisplayName || tProfile("notProvided")}</span>
              )}
            </div>
            <div className='d-flex justify-content-between align-items-center py-8'>
              <span className='text-sm text-gray-600'>{`${tProfile("district")}:`}</span>
              {isEditingProfile ? (
                <select
                  name='district'
                  className={`form-select form-select-sm ${isEditingProfile ? 'editable' : 'disabled'}`}
                  value={profileFormData.district || ''}
                  onChange={onInputChange}
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
                <span className='text-sm fw-medium text-gray-900'>{districtDisplayName || tProfile("notProvided")}</span>
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
                  onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder={tProfileForm("tellAboutYourself")}
              disabled={!isEditingProfile}
              rows='3'
            />
          ) : (
            <p className='text-sm text-gray-600 mb-0'>{userData?.bio || tProfile("bioEmpty")}</p>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditingProfile ? (
          <div className='d-flex flex-column gap-8'>
            <button
              className='btn btn-outline-main w-100 py-12'
              onClick={onEditProfile}
            >
              <i className='ph ph-pencil me-8'></i>
              {tProfile("editProfile")}
            </button>
            <button
              className='btn btn-outline-danger w-100 py-12'
              onClick={onLogout}
            >
              <i className='ph ph-sign-out me-8'></i>
              {tProfile("logout")}
            </button>
          </div>
        ) : (
          <div className='d-flex gap-8'>
            <button
              className='btn btn-main flex-fill py-12'
              onClick={onSaveProfile}
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
              onClick={onCancelEdit}
              disabled={saving}
            >
              <i className='ph ph-x me-8'></i>
              {tProfile("cancel")}
            </button>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default ProfileSidebar;

