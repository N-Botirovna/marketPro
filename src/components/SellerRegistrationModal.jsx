"use client";
import React, { useState, useEffect } from "react";
import { getRegions } from "@/services/regions";
import { createShop } from "@/services/shopCreate";
import Spin from "./Spin";
import { useToast } from "./Toast";

const SellerRegistrationModal = ({ show, onHide }) => {
  const { showToast, ToastContainer } = useToast();
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
  const [success, setSuccess] = useState("");

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getRegions({ limit: 50 });
        setRegions(response.regions || []);
      } catch (err) {
        console.error('Regions yuklashda xatolik:', err);
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
    setSuccess("");

    // Validation
    if (!formData.name || !formData.phone_number || !formData.region || !formData.picture) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring (do'kon rasmi ham kerak)");
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
          title: 'Muvaffaqiyatli!',
          message: 'Sotuvchi arizasi muvaffaqiyatli jo\'natildi',
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
        setError(result.message);
      }
    } catch (err) {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
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
            <h5 className="modal-title">Sotuvchi hisobi yaratish</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success mb-3">
                  {success}
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Do'kon nomi *</label>
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
                  <label className="form-label">Telefon raqam *</label>
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
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Viloyat *</label>
                  <select
                    className="form-select"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Viloyatni tanlang</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tuman</label>
                  <select
                    className="form-select"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                  >
                    <option value="">Tumanni tanlang</option>
                    {regions
                      .find(r => r.id === parseInt(formData.region))
                      ?.districts?.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Joylashuv matni</label>
                <input
                  type="text"
                  className="form-control"
                  name="location_text"
                  value={formData.location_text}
                  onChange={handleInputChange}
                  placeholder="Masalan: Toshkent shahar, Chilonzor tumani"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Do'koningiz haqida qisqacha ma'lumot"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Telegram</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    placeholder="@username"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Instagram</label>
                  <input
                    type="text"
                    className="form-control"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Veb-sayt</label>
                <input
                  type="url"
                  className="form-control"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Do'kon rasmi *</label>
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
                  JPG, PNG yoki GIF formatida, maksimal 5MB
                </small>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Ish kunlari</label>
                  <input
                    type="text"
                    className="form-control"
                    name="working_days"
                    value={formData.working_days}
                    onChange={handleInputChange}
                    placeholder="Dushanba - Juma"
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Ish vaqti</label>
                  <input
                    type="text"
                    className="form-control"
                    name="working_hours"
                    value={formData.working_hours}
                    onChange={handleInputChange}
                    placeholder="09:00 - 18:00"
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tushlik vaqti</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lunch"
                    value={formData.lunch}
                    onChange={handleInputChange}
                    placeholder="12:00 - 13:00"
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
                    Pochta xizmati mavjud
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
                Bekor qilish
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spin size="sm" text="Yaratilmoqda..." />
                    Yaratilmoqda...
                  </>
                ) : (
                  "Hisob yaratish"
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
