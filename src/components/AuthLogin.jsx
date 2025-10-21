"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPhoneOtp } from "@/services/auth";

const AuthLogin = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Handle login with phone and OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        setSuccess("Muvaffaqiyatli kirildi! Yo'naltirilmoqda...");
        setTimeout(() => {
          router.push('/');
        }, 1500);
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
          padding: 24px;
          margin-bottom: 24px;
        }
        
        .telegram-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
        }
        
        .telegram-button {
          background: white;
          color: #0088cc;
          border: 2px solid white;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
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
            <div className='col-xl-6 col-lg-8'>
              <div className='text-center mb-48'>
                <h2 className='text-3xl fw-bold mb-16 welcome-title'>
                  Kitobzorga xush kelibsiz!
                </h2>
                <p className='text-gray-600 text-lg'>
                  Kirish uchun quyidagi ma'lumotlarni to'ldiring
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='form-container px-32 py-48'>
                  {/* Telegram Bot Section */}
                  <div className='text-center mb-32'>
                    <div className='telegram-section'>
                      <div className='telegram-icon'>
                        <i className='ph ph-telegram-logo text-2xl text-blue-600'></i>
                      </div>
                      <h4 className='text-white fw-bold mb-8'>@kitobzoruz_bot</h4>
                      <p className='text-white mb-16 opacity-90'>
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
                  <div className='mb-24'>
                    <label htmlFor='phone' className='text-neutral-900 text-lg mb-8 fw-medium d-block'>
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
                    />
                  </div>

                  <div className='mb-24'>
                    <label htmlFor='password' className='text-neutral-900 text-lg mb-8 fw-medium d-block'>
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
                    />
                    <small className='text-gray-500 text-sm mt-8 d-block'>
                      @kitobzoruz_bot dan olingan parolni kiriting
                    </small>
                  </div>
                  {/* Error/Success Messages */}
                  {error && (
                    <div className='mb-24'>
                      <div className='alert alert-danger d-flex align-items-center gap-8'>
                        <i className='ph ph-warning text-lg'></i>
                        {error}
                      </div>
                    </div>
                  )}
                  
                  {success && (
                    <div className='mb-24'>
                      <div className='alert alert-success d-flex align-items-center gap-8'>
                        <i className='ph ph-check-circle text-lg'></i>
                        {success}
                      </div>
                    </div>
                  )}
                  {/* Submit Button */}
                  <div className='mb-24 mt-40'>
                    <button 
                      type='submit' 
                      className='btn btn-main w-100 py-18 px-40' 
                      disabled={loading || !phoneNumber || !password}
                    >
                      {loading ? "Kirinmoqda..." : "Kirish"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AuthLogin;


