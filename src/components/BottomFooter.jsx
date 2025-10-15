import React from "react";

const BottomFooter = () => {
  return (
    <div className='bottom-footer bg-color-one py-8'>
      <div className='container container-lg'>
        <div className='bottom-footer__inner flex-between flex-wrap gap-16 py-16'>
          <p className='bottom-footer__text '>
            Kitobzor © 2024. Barcha huquqlar himoyalangan{" "}
          </p>
          <div className='flex-align gap-8 flex-wrap'>
            <span className='text-heading text-sm'>Biz qabul qilamiz</span>
            <img
              src='assets/images/thumbs/payment-method.png'
              alt='marketpro'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomFooter;
