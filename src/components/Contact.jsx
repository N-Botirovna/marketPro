"use client";
import React, { useState } from "react";
import Link from "next/link";
import { sendContactMessage } from "@/services/contact";

const Contact = () => {
  const [formData, setFormData] = useState({
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.phone || !formData.message) {
      setError('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    try {
      const response = await sendContactMessage({
        phone: formData.phone,
        message: formData.message
      });

      if (response.success) {
        setSuccess('Xabaringiz muvaffaqiyatli yuborildi!');
        setFormData({ phone: '', message: '' });
      } else {
        setError(response.message || 'Xabar yuborishda xatolik yuz berdi');
      }
    } catch (err) {
      setError(err?.normalized?.message || 'Xabar yuborishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='contact py-80'>
      <div className='container container-lg'>
        <div className='row gy-5'>
          <div className='col-lg-8'>
            <div className='contact-box border border-gray-100 rounded-16 px-24 py-40'>
              <form onSubmit={handleSubmit}>
                <h6 className='mb-32'>Xabar yuborish</h6>
                
                {error && (
                  <div className='alert alert-danger mb-24'>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className='alert alert-success mb-24'>
                    {success}
                  </div>
                )}

                <div className='row gy-4'>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='phone'
                      className='flex-align gap-4 text-sm font-heading-two text-gray-900 fw-semibold mb-4'
                    >
                      Telefon raqam
                      <span className='text-danger text-xl line-height-1'>
                        *
                      </span>{" "}
                    </label>
                    <input
                      type='tel'
                      className='common-input px-16'
                      id='phone'
                      name='phone'
                      placeholder='+998901234567'
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className='col-sm-12'>
                    <label
                      htmlFor='message'
                      className='flex-align gap-4 text-sm font-heading-two text-gray-900 fw-semibold mb-4'
                    >
                      Xabar
                      <span className='text-danger text-xl line-height-1'>
                        *
                      </span>{" "}
                    </label>
                    <textarea
                      className='common-input px-16'
                      id='message'
                      name='message'
                      placeholder='Xabaringizni yozing'
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      required
                    />
                  </div>
                  <div className='col-sm-12 mt-32'>
                    <button
                      type='submit'
                      className='btn btn-main py-18 px-32 rounded-8'
                      disabled={loading}
                    >
                      {loading ? 'Yuborilmoqda...' : 'Xabar yuborish'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className='col-lg-4'>
            <div className='contact-box border border-gray-100 rounded-16 px-24 py-40'>
              <h6 className='mb-48'>Bog'lanish</h6>
              <div className='flex-align gap-16 mb-16'>
                <span className='w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0'>
                  <i className='ph-fill ph-phone-call' />
                </span>
                <a
                  href='tel:+00123456789'
                  className='text-md text-gray-900 hover-text-main-600'
                >
                  +00 123 456 789
                </a>
              </div>
              <div className='flex-align gap-16 mb-16'>
                <span className='w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0'>
                  <i className='ph-fill ph-envelope' />
                </span>
                <Link
                  href='/mailto:support24@marketpro.com'
                  className='text-md text-gray-900 hover-text-main-600'
                >
                  support24@marketpro.com
                </Link>
              </div>
              <div className='flex-align gap-16 mb-0'>
                <span className='w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0'>
                  <i className='ph-fill ph-map-pin' />
                </span>
                <span className='text-md text-gray-900 '>
                  789 Inner Lane, California, USA
                </span>
              </div>
            </div>
            <div className='mt-24 flex-align flex-wrap gap-16'>
              <Link
                href='#'
                className='bg-neutral-600 hover-bg-main-600 rounded-8 p-10 px-16 flex-between flex-wrap gap-8 flex-grow-1'
              >
                <span className='text-white fw-medium'>
                  Qo'llab-quvvatlash
                </span>
                <span className='w-36 h-36 bg-main-600 rounded-8 flex-center text-xl text-white'>
                  <i className='ph ph-headset' />
                </span>
              </Link>
              <Link
                href='#'
                className='bg-neutral-600 hover-bg-main-600 rounded-8 p-10 px-16 flex-between flex-wrap gap-8 flex-grow-1'
              >
                <span className='text-white fw-medium'>Yo'l ko'rsatish</span>
                <span className='w-36 h-36 bg-main-600 rounded-8 flex-center text-xl text-white'>
                  <i className='ph ph-map-pin' />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
