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
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 22px;
        }
        
        .telegram-icon {
          width: 44px;
          height: 44px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
        }
        
        .telegram-button {
          background: white;
          color: #0088cc;
          border: 2px solid white;
          border-radius: 8px;
          padding: 11px 22px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.3s ease;
          font-size: 15px;
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
      <section className='account py-80'>
        <div className='container container-lg'>
          <div className='row justify-content-center'>
            <div className='col-xl-5 col-lg-7 col-md-9'>
              <div className='text-center mb-40'>
                <h2 className='fw-bold mb-16 welcome-title' style={{ fontSize: '2rem' }}>
                  Kitobzorga xush kelibsiz!
                </h2>
                <p className='text-gray-600' style={{ fontSize: '1rem' }}>
                  Kirish uchun quyidagi ma'lumotlarni to'ldiring
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='form-container px-28 py-40'>
                  {/* Telegram Bot Section */}
                  <div className='text-center mb-28'>
                    <div className='telegram-section'>
                      <div className='telegram-icon'>
                        <i className='ph ph-telegram-logo text-xl text-blue-600'></i>
                      </div>
                      <h5 className='text-white fw-bold mb-8'>@kitobzoruz_bot</h5>
                      <p className='text-white mb-14 opacity-90' style={{ fontSize: '15px' }}>
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
                  <div className='mb-22'>
                    <label htmlFor='phone' className='text-neutral-900 mb-8 fw-medium d-block' style={{ fontSize: '1rem' }}>
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
                      style={{ padding: '14px 18px', fontSize: '15px' }}
                    />
                  </div>

                  <div className='mb-22'>
                    <label htmlFor='password' className='text-neutral-900 mb-8 fw-medium d-block' style={{ fontSize: '1rem' }}>
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
                      style={{ padding: '14px 18px', fontSize: '15px' }}
                    />
                    <small className='text-gray-500 mt-8 d-block' style={{ fontSize: '14px' }}>
                      @kitobzoruz_bot dan olingan parolni kiriting
                    </small>
                  </div>
                  {/* Error/Success Messages */}
                  {error && (
                    <div className='mb-22'>
                      <div className='alert alert-danger d-flex align-items-center gap-8' style={{ padding: '14px 18px' }}>
                        <i className='ph ph-warning' style={{ fontSize: '1.1rem' }}></i>
                        <span style={{ fontSize: '15px' }}>{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className='mb-22 mt-32'>
                    <button 
                      type='submit' 
                      className='btn btn-main w-100' 
                      style={{ padding: '16px 36px', fontSize: '16px' }}
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


