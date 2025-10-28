"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPhoneOtp } from "@/services/auth";
import Spin from "./Spin";
import { useToast } from "./Toast";

const AuthLogin = () => {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Handle login with phone and OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber || !password) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Iltimos, to'g'ri telefon raqam kiriting (masalan: +998901234567)");
      return;
    }

    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPhoneOtp({
        phone_number: phoneNumber,
        otp_code: password,
      });
      
      if (res.access_token || res.token) {
        showToast({
          type: 'success',
          title: 'Muvaffaqiyatli!',
          message: 'Tizimga muvaffaqiyatli kirdingiz',
          duration: 2000
        });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError("Kirish muvaffaqiyatsiz. Parolni tekshiring.");
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err?.normalized?.message || err?.response?.data?.message || "Kirish muvaffaqiyatsiz";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .telegram-section {
          background: linear-gradient(135deg, #0088cc 0%, #229ED9 100%);
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 18px;
        }
        
        .telegram-icon {
          width: 38px;
          height: 38px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          box-shadow: 0 3px 10px rgba(0, 136, 204, 0.3);
        }
        
        .telegram-button {
          background: white;
          color: #0088cc;
          border: 2px solid white;
          border-radius: 7px;
          padding: 9px 18px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 14px;
        }
        
        .telegram-button:hover {
          background: #0088cc;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 136, 204, 0.4);
        }
        
        .form-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        .form-container:hover {
          border-color: #FA6400;
          box-shadow: 0 15px 50px rgba(250, 100, 0, 0.15);
        }
        
        .welcome-title {
          background: linear-gradient(135deg, #FA6400 0%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      <section className='account' style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className='container container-lg'>
          <div className='row justify-content-center'>
            <div className='col-xl-4 col-lg-5 col-md-7 col-sm-9'>
              <div className='text-center mb-28'>
                <h2 className='fw-bold mb-12 welcome-title' style={{ fontSize: '1.75rem' }}>
                  Kitobzorga xush kelibsiz!
                </h2>
                <p className='text-gray-600' style={{ fontSize: '0.95rem' }}>
                  Kirish uchun quyidagi ma'lumotlarni to'ldiring
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='form-container px-24 py-28'>
                  {/* Telegram Bot Section */}
                  <div className='text-center mb-20'>
                    <div className='telegram-section'>
                      <div className='telegram-icon'>
                        <i className='ph ph-telegram-logo text-lg text-blue-600'></i>
                      </div>
                      <h6 className='text-white fw-bold mb-6' style={{ fontSize: '1rem' }}>@kitobzoruz_bot</h6>
                      <p className='text-white mb-10 opacity-90' style={{ fontSize: '13px' }}>
                        Parolni olish uchun Telegram botga o'ting
                      </p>
                      <a 
                        href='https://t.me/kitobzoruz_bot' 
                        target='_blank' 
                        rel='noopener noreferrer'
                        className='telegram-button'
                      >
                        <i className='ph ph-telegram-logo'></i>
                        Telegram botga o'tish
                      </a>
                    </div>
                  </div>
                  {/* Form Fields */}
                  <div className='mb-18'>
                    <label htmlFor='phone' className='text-neutral-900 mb-6 fw-medium d-block' style={{ fontSize: '0.95rem' }}>
                      Telefon raqam <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='tel'
                      className='common-input'
                      id='phone'
                      placeholder='+998901234567'
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      style={{ padding: '12px 16px', fontSize: '14px' }}
                    />
                  </div>

                  <div className='mb-18'>
                    <label htmlFor='password' className='text-neutral-900 mb-6 fw-medium d-block' style={{ fontSize: '0.95rem' }}>
                      Parol <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='password'
                      className='common-input'
                      id='password'
                      placeholder='Parolingizni kiriting'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ padding: '12px 16px', fontSize: '14px' }}
                    />
                    <small className='text-gray-500 mt-6 d-block' style={{ fontSize: '13px' }}>
                      @kitobzoruz_bot dan olingan parolni kiriting
                    </small>
                  </div>
                  {/* Error/Success Messages */}
                  {error && (
                    <div className='mb-18'>
                      <div className='alert alert-danger d-flex align-items-center gap-6' style={{ padding: '12px 16px' }}>
                        <i className='ph ph-warning' style={{ fontSize: '1rem' }}></i>
                        <span style={{ fontSize: '14px' }}>{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className='mb-16 mt-24'>
                    <button 
                      type='submit' 
                      className='btn btn-main w-100' 
                      style={{ padding: '14px 32px', fontSize: '15px' }}
                      disabled={loading || !phoneNumber || !password}
                    >
                      {loading ? (
                        <>
                          <Spin size="sm" text="Kirinmoqda..." />
                          Kirinmoqda...
                        </>
                      ) : (
                        "Kirish"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default AuthLogin;


