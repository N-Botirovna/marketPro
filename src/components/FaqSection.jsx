"use client";
import React, { useState, useEffect } from "react";
import { getFaqs } from "@/services/faqs";

const FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching FAQs...');
        const response = await getFaqs({ limit: 20 });
        console.log('📋 FAQs response:', response);
        setFaqs(response.faqs || []);
      } catch (err) {
        console.error('❌ FAQ yuklashda xatolik:', err);
        setError(err?.normalized?.message || err?.message || 'FAQ yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className='faq py-80'>
        <div className='container container-lg'>
          <div className='text-center py-80'>
            <div className='spinner-border text-main-600' role='status'>
              <span className='visually-hidden'>Yuklanmoqda...</span>
            </div>
            <p className='mt-16 text-gray-600'>FAQ ma'lumotlari yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='faq py-80'>
        <div className='container container-lg'>
          <div className='text-center py-80'>
            <div className='text-danger mb-16'>
              <i className='ph ph-warning text-4xl'></i>
            </div>
            <h5 className='text-danger mb-8'>FAQ yuklashda xatolik yuz berdi</h5>
            <p className='text-gray-600'>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className='btn btn-outline-danger mt-16'
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!faqs || faqs.length === 0) {
    return (
      <section className='faq py-80'>
        <div className='container container-lg'>
          <div className='text-center py-80'>
            <div className='text-gray-500 mb-16'>
              <i className='ph ph-question text-6xl'></i>
            </div>
            <h5 className='text-gray-700 mb-8'>FAQ topilmadi</h5>
            <p className='text-gray-600'>Hozircha savollar mavjud emas</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='faq py-80'>
      <div className='container container-lg'>
        <div className='row justify-content-center'>
          <div className='col-xl-8 col-lg-10'>
            <div className='section-heading text-center mb-48'>
              <h2 className='section-heading__title'>Tez-tez so'raladigan savollar</h2>
              <p className='section-heading__desc'>
                Bizga tez-tez beriladigan savollarga javoblar
              </p>
            </div>
            
            <div className='accordion' id='faqAccordion'>
              {faqs.map((faq, index) => (
                <div key={faq.id || index} className='accordion-item border border-gray-100 rounded-12 mb-16 shadow-sm'>
                  <h2 className='accordion-header'>
                    <button
                      className={`accordion-button fw-medium text-start ${activeIndex !== index ? 'collapsed' : ''}`}
                      type='button'
                      onClick={() => toggleFaq(index)}
                      aria-expanded={activeIndex === index}
                      style={{
                        backgroundColor: activeIndex === index ? '#FA6400' : '#fff',
                        color: activeIndex === index ? '#fff' : '#333',
                        border: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      <i className={`ph ph-${activeIndex === index ? 'minus' : 'plus'} text-lg me-12`}></i>
                      {faq.question}
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${activeIndex === index ? 'show' : ''}`}
                    data-bs-parent='#faqAccordion'
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className='accordion-body bg-gray-50 text-gray-700'>
                      <div className='d-flex align-items-start gap-12'>
                        <i className='ph ph-info text-main-600 text-lg mt-2 flex-shrink-0'></i>
                        <div className='flex-grow-1'>
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
