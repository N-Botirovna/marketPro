"use client";
import React, { useState } from "react";
import { loginWithPhoneOtp } from "@/services/auth";

const AuthLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await loginWithPhoneOtp({
        phone_number: phoneNumber,
        otp_code: otpCode,
      });
      setSuccess("Login successful");
    } catch (err) {
      const message = err?.normalized?.message || err?.response?.data?.message || "Login failed";
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
                    Phone Number <span className='text-danger'>*</span>
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
                    OTP Code <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text'
                    className='common-input'
                    id='otp'
                    placeholder='123456'
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
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
                    <button type='submit' className='btn btn-main py-18 px-40' disabled={loading}>
                      {loading ? "Loading..." : "Log in"}
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


