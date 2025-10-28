"use client";
import React, { useState, useEffect } from "react";
import { getFaqs } from "@/services/faqs";
import Spin from "./Spin";

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
            <Spin text="FAQ ma'lumotlari yuklanmoqda..." />
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
    <>
      <style jsx>{`
        .faq-section {
          background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
        }
        
        .faq-title {
          font-size: 2.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        
        .faq-subtitle {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .faq-collapse {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .faq-collapse + .faq-collapse {
          margin-top: 14px;
        }
        
        .faq-collapse:hover {
          border-color: #FA6400;
          box-shadow: 0 4px 12px rgba(250, 100, 0, 0.1);
        }
        
        .faq-header {
          width: 100%;
          padding: 20px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 17px;
          font-weight: 500;
          color: #1a1a1a;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .faq-header:hover {
          color: #FA6400;
        }
        
        .faq-header:hover .faq-arrow {
          color: #FA6400;
        }
        
        .faq-question {
          flex: 1;
          padding-right: 20px;
        }
        
        .faq-arrow {
          font-size: 20px;
          color: #999;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .faq-arrow.active {
          transform: rotate(180deg);
          color: #FA6400;
        }
        
        .faq-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          padding: 0 24px;
        }
        
        .faq-content.show {
          max-height: 1000px;
          opacity: 1;
          padding: 0 24px 24px 24px;
        }
        
        .faq-body {
          color: #555;
          font-size: 15px;
          line-height: 1.8;
          padding-top: 4px;
          border-top: 1px solid #f5f5f5;
          padding-top: 16px;
        }
      `}</style>
      
      <section className='faq py-80 faq-section'>
        <div className='container container-lg'>
          <div className='row justify-content-center'>
            <div className='col-xl-8 col-lg-10'>
              <div className='text-center mb-48'>
                <h2 className='faq-title'>
                  Tez-tez so'raladigan savollar
                </h2>
                <p className='faq-subtitle'>
                  Bizga tez-tez beriladigan savollarga javoblar
                </p>
              </div>
              
              <div>
                {faqs.map((faq, index) => (
                  <div 
                    key={faq.id || index} 
                    className='faq-collapse'
                  >
                    <button
                      className='faq-header'
                      type='button'
                      onClick={() => toggleFaq(index)}
                      aria-expanded={activeIndex === index}
                    >
                      <span className='faq-question'>{faq.question}</span>
                      <i className={`ph-bold ph-caret-down faq-arrow ${activeIndex === index ? 'active' : ''}`}></i>
                    </button>
                    
                    <div className={`faq-content ${activeIndex === index ? 'show' : ''}`}>
                      <div className='faq-body'>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqSection;
