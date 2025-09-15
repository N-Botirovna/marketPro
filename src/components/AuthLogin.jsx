"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPhoneOtp } from "@/services/auth";

const AuthLogin = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
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

    if (!phoneNumber || !otpCode) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Iltimos, to'g'ri telefon raqam kiriting (masalan: +998901234567)");
      return;
    }

    if (otpCode.length !== 6) {
      setError("OTP kodi 6 raqamdan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPhoneOtp({
        phone_number: phoneNumber,
        otp_code: otpCode,
      });
      
      if (res.token) {
        setSuccess("Muvaffaqiyatli kirildi! Yo'naltirilmoqda...");
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError("Kirish muvaffaqiyatsiz. OTP kodini tekshiring.");
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
    <section className='account py-80'>
      <div className='container container-lg'>
        <form onSubmit={handleSubmit}>
          <div className='row gy-4'>
            <div className='col-xl-6 pe-xl-5'>
              <div className='border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100'>
                <h6 className='text-xl mb-32'>Login</h6>
                <div className='mb-24'>
                  <label htmlFor='phone' className='text-neutral-900 text-lg mb-8 fw-medium'>
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
                  <label htmlFor='otp' className='text-neutral-900 text-lg mb-8 fw-medium'>
                    OTP kodi <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text'
                    className='common-input'
                    id='otp'
                    placeholder='OTP kodingizni kiriting'
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                {error && (
                  <div className='mb-24'>
                    <div className='text-danger-600'>{error}</div>
                  </div>
                )}
                {success && (
                  <div className='mb-24'>
                    <div className='text-main-600'>{success}</div>
                  </div>
                )}
                <div className='mb-24 mt-48'>
                  <div className='flex-align gap-48 flex-wrap'>
                    <button 
                      type='submit' 
                      className='btn btn-main py-18 px-40' 
                      disabled={loading || !phoneNumber || !otpCode}
                    >
                      {loading ? "Kirinmoqda..." : "Kirish"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AuthLogin;


