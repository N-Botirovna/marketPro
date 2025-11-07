"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import SellerRegistrationModal from "./SellerRegistrationModal";

const WhyBecomeSeller = () => {
  const [showModal, setShowModal] = useState(false);
  const tWhy = useTranslations("WhyBecomeSeller");

  return (
    <section className='why-seller py-80'>
      <div className='container'>
        <div className='section-heading text-center mx-auto'>
          <h5 className=''>{tWhy("title")}</h5>
          <span className='text-gray-600'>
            {tWhy("subtitle")}
          </span>
          <div className='mt-32 d-flex justify-content-center'>
            <button 
              onClick={() => setShowModal(true)}
              className='btn btn-main-two px-40 py-16 rounded-pill fw-bold'
              style={{ fontSize: '18px', boxShadow: '0 8px 24px rgba(250, 100, 0, 0.3)' }}
            >
              <i className='ph ph-user-plus me-8'></i>
              {tWhy("createAccount")}
            </button>
          </div>
        </div>
        <div className='row gy-4 justify-content-center'>
          <div className='col-lg-4 col-sm-6'>
            <div className='why-seller-item text-center'>
              <span className='text-main-two-600 text-72 d-inline-flex'>
                <i className='ph ph-gift' />
              </span>
              <h6 className='my-28'>{tWhy("freeDelivery")}</h6>
              <p className='text-gray-600 max-w-392 mx-auto'>
                {tWhy("freeDeliveryDesc")}
              </p>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='why-seller-item text-center'>
              <span className='text-main-two-600 text-72 d-inline-flex'>
                <i className='ph ph-credit-card' />
              </span>
              <h6 className='my-28'>{tWhy("flexiblePayment")}</h6>
              <p className='text-gray-600 max-w-392 mx-auto'>
                {tWhy("flexiblePaymentDesc")}
              </p>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='why-seller-item text-center'>
              <span className='text-main-two-600 text-72 d-inline-flex'>
                <i className='ph ph-chats' />
              </span>
              <h6 className='my-28'>{tWhy("onlineSupport")}</h6>
              <p className='text-gray-600 max-w-392 mx-auto'>
                {tWhy("onlineSupportDesc")}
              </p>
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

export default WhyBecomeSeller;
