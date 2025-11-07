"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getRegions } from "@/services/regions";
import { createShop } from "@/services/shopCreate";
import Spin from "./Spin";
import { useToast } from "./Toast";

const SellerRegistrationModal = ({ show, onHide }) => {
  const { showToast, ToastContainer } = useToast();
  const tSeller = useTranslations("SellerRegistration");
  const tCommon = useTranslations("Common");
  const tButtons = useTranslations("Buttons");
  const [formData, setFormData] = useState({
    point: "",
    name: "",
    bio: "",
    picture: null,
    location_text: "",
    phone_number: "",
    telegram: "",
    instagram: "",
    website: "",
    working_days: "",
    working_hours: "",
    lunch: "",
    has_post_service: false,
    district: "",
    region: ""
  });
  
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRegion = regions.find((r) => r.id === parseInt(formData.region));

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getRegions({ limit: 50 });
        setRegions(response.regions || []);
      } catch (err) {
        console.error(tSeller("error"), err);
      }
    };
    fetchRegions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.phone_number || !formData.region || !formData.picture) {
      setError(tSeller("fillRequiredFields"));
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        phone_number: `+998${formData.phone_number}`, // Add +998 prefix
        region: parseInt(formData.region),
        district: formData.district ? parseInt(formData.district) : 0
      };
      
      console.log('📤 Sending to API:', apiData);
      
      const result = await createShop(apiData);

      if (result.success) {
        showToast({
          type: 'success',
          title: tCommon("success"),
          message: tSeller("successMessage"),
          duration: 3000
        });
        setFormData({
          point: "",
          name: "",
          bio: "",
          picture: null,
          location_text: "",
          phone_number: "",
          telegram: "",
          instagram: "",
          website: "",
          working_days: "",
          working_hours: "",
          lunch: "",
          has_post_service: false,
          district: "",
          region: ""
        });
        setTimeout(() => {
          onHide();
        }, 2000);
      } else {
        setError(result.message || tSeller("error"));
      }
    } catch (err) {
      setError(tSeller("error"));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{tSeller("modalTitle")}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              aria-label={tButtons("cancel")}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{tSeller("shopName")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">{tSeller("phoneNumber")}</label>
                  <div className="input-group">
                    <span className="input-group-text">+998</span>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 9) {
                          setFormData(prev => ({
                            ...prev,
                            phone_number: value
                          }));
                        }
                      }}
                      maxLength={9}
                      placeholder={tSeller("phonePlaceholder")}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{tSeller("region")}</label>
                  <select
                    className="form-select"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{tSeller("selectRegion")}</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">{tSeller("district")}</label>
                  <select
                    className="form-select"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                  >
                    <option value="">{tSeller("selectDistrict")}</option>
                    {selectedRegion?.districts?.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">{tSeller("locationText")}</label>
                <input
                  type="text"
                  className="form-control"
                  name="location_text"
                  value={formData.location_text}
                  onChange={handleInputChange}
                  placeholder={tSeller("locationPlaceholder")}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">{tSeller("bio")}</label>
                <textarea
                  className="form-control"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder={tSeller("bioPlaceholder")}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{tSeller("telegram")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    placeholder={tSeller("telegramPlaceholder")}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">{tSeller("instagram")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder={tSeller("instagramPlaceholder")}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">{tSeller("website")}</label>
                <input
                  type="url"
                  className="form-control"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder={tSeller("websitePlaceholder")}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">{tSeller("shopImage")}</label>
                <input
                  type="file"
                  className="form-control"
                  name="picture"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        picture: file
                      }));
                    }
                  }}
                  required
                />
                <small className="form-text text-muted">
                  {tSeller("imageHelp")}
                </small>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">{tSeller("workingDays")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="working_days"
                    value={formData.working_days}
                    onChange={handleInputChange}
                    placeholder={tSeller("workingDaysPlaceholder")}
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">{tSeller("workingHours")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="working_hours"
                    value={formData.working_hours}
                    onChange={handleInputChange}
                    placeholder={tSeller("workingHoursPlaceholder")}
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">{tSeller("lunch")}</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lunch"
                    value={formData.lunch}
                    onChange={handleInputChange}
                    placeholder={tSeller("lunchPlaceholder")}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="has_post_service"
                    checked={formData.has_post_service}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    {tSeller("hasPostService")}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onHide}
              >
                {tButtons("cancel")}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spin size="sm" text={tSeller("creating") || ""} />
                    {tSeller("creating")}
                  </>
                ) : (
                  tSeller("createAccountButton")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SellerRegistrationModal;
