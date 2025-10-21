"use client";
import React, { useState } from "react";
import SellerRegistrationModal from "./SellerRegistrationModal";

const StepsSection = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className='step py-80'>
      <div className='position-relative z-1'>
        <img
          src='assets/images/shape/curve-line-shape.png'
          alt=''
          className='position-absolute top-0 inset-inline-end-0 z-n1 me-60 d-lg-block d-none'
        />
        <div className='container container-lg'>
          <div className='row gy-4'>
            <div className='col-lg-6'>
              <div className='step-content'>
                <div className='section-heading ms-auto text-end'>
                  <h5 className=''>200,000$ dan ortiq potentsial foyda</h5>
                  <span className='text-gray-600'>
                    Sotishga tayyormisiz? Bugun o'z brendingizni ishga tushiring va 
                    yangi sotuvchilar uchun 200,000$ dan ortiq foyda oling
                  </span>
                </div>
                <div className='d-flex flex-column align-items-end gap-56'>
                  <div className='d-flex align-items-center gap-32'>
                    <div className='text-end'>
                      <h5 className='mb-8'>1-qadam</h5>
                      <p className='text-gray-600'>
                        Bizning veb-saytimizda hisob yarating. Bu tez va bepul.
                      </p>
                    </div>
                    <div className='w-90 h-90 flex-center bg-main-two-100 rounded-circle'>
                      <h6 className='mb-0 w-60 h-60 bg-main-two-600 text-white d-flex align-items-center justify-content-center rounded-circle border border-5 border-white fw-medium'>
                        01
                      </h6>
                    </div>
                  </div>
                  <div className='d-flex align-items-center gap-32'>
                    <div className='text-end'>
                      <h5 className='mb-8'>2-qadam</h5>
                      <p className='text-gray-600'>
                        Kitoblaringizni yuklang va do'koningizda ko'rsating.
                      </p>
                    </div>
                    <div className='w-90 h-90 flex-center bg-main-two-100 rounded-circle'>
                      <h6 className='mb-0 w-60 h-60 bg-main-two-600 text-white d-flex align-items-center justify-content-center rounded-circle border border-5 border-white fw-medium'>
                        02
                      </h6>
                    </div>
                  </div>
                  <div className='d-flex align-items-center gap-32'>
                    <div className='text-end'>
                      <h5 className='mb-8'>3-qadam</h5>
                      <p className='text-gray-600'>
                        Biz hisobingizni tekshiramiz va keyin siz sotishni boshlashingiz mumkin!
                      </p>
                    </div>
                    <div className='w-90 h-90 flex-center bg-main-two-100 rounded-circle'>
                      <h6 className='mb-0 w-60 h-60 bg-main-two-600 text-white d-flex align-items-center justify-content-center rounded-circle border border-5 border-white fw-medium'>
                        03
                      </h6>
                    </div>
                  </div>
                  <div className='mt-40'>
                    <button 
                      onClick={() => setShowModal(true)}
                      className='btn btn-main px-40 py-16 rounded-pill'
                    >
                      Hisob yaratish
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-6'>
              <div className='text-center'>
                <img src='assets/images/thumbs/steps.png' alt='' />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seller Registration Modal */}
      <SellerRegistrationModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
      />
    </section>
  );
};

export default StepsSection;
