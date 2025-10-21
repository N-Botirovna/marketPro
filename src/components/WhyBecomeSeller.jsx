import React from "react";

const WhyBecomeSeller = () => {
  return (
    <section className='why-seller py-80'>
      <div className='container'>
        <div className='section-heading text-center mx-auto'>
          <h5 className=''>Nima uchun Kitobzorda sotuvchi bo'lish kerak?</h5>
          <span className='text-gray-600'>
            Bizning do'konlarda sotilgan kitoblarning yarmidan ko'pi mustaqil sotuvchilar tomonidan sotiladi.
          </span>
        </div>
        <div className='row gy-4 justify-content-center'>
          <div className='col-lg-4 col-sm-6'>
            <div className='why-seller-item text-center'>
              <span className='text-main-two-600 text-72 d-inline-flex'>
                <i className='ph ph-gift' />
              </span>
              <h6 className='my-28'>Bepul Yetkazib Berish</h6>
              <p className='text-gray-600 max-w-392 mx-auto'>
                Kitoblaringizni butun O'zbekiston bo'ylab bepul yetkazib beramiz. 
                Mijozlaringizga qulaylik yarating.
              </p>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='why-seller-item text-center'>
              <span className='text-main-two-600 text-72 d-inline-flex'>
                <i className='ph ph-credit-card' />
              </span>
              <h6 className='my-28'>Moslashuvchan To'lov</h6>
              <p className='text-gray-600 max-w-392 mx-auto'>
                Turli xil to'lov usullarini qo'llab-quvvatlaymiz. 
                Naqd pul, bank karta yoki onlayn to'lov - siz tanlang.
              </p>
            </div>
          </div>
          <div className='col-lg-4 col-sm-6'>
            <div className='why-seller-item text-center'>
              <span className='text-main-two-600 text-72 d-inline-flex'>
                <i className='ph ph-chats' />
              </span>
              <h6 className='my-28'>Onlayn Qo'llab-quvvatlash</h6>
              <p className='text-gray-600 max-w-392 mx-auto'>
                24/7 qo'llab-quvvatlash xizmati. Har qanday savol yoki muammo bo'lsa, 
                bizning mutaxassislarimiz sizga yordam beradi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBecomeSeller;
