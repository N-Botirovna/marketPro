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
        const response = await getFaqs({ limit: 20 });
        setFaqs(response.faqs);
      } catch (err) {
        console.error('FAQ yuklashda xatolik:', err);
        setError(err.message);
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
          <div className='text-center'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='faq py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <p className='text-danger'>FAQ yuklashda xatolik yuz berdi</p>
          </div>
        </div>
      </section>
    );
  }

  if (!faqs || faqs.length === 0) {
    return (
      <section className='faq py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <p className='text-muted'>FAQ topilmadi</p>
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
                <div key={faq.id || index} className='accordion-item border border-gray-100 rounded-8 mb-16'>
                  <h2 className='accordion-header'>
                    <button
                      className={`accordion-button ${activeIndex !== index ? 'collapsed' : ''}`}
                      type='button'
                      onClick={() => toggleFaq(index)}
                      aria-expanded={activeIndex === index}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${activeIndex === index ? 'show' : ''}`}
                    data-bs-parent='#faqAccordion'
                  >
                    <div className='accordion-body'>
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
  );
};

export default FaqSection;
