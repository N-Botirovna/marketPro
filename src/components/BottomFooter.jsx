import React from "react";
import { useTranslations } from "next-intl";

const BottomFooter = () => {
  const tBF = useTranslations('BottomFooter');
  return (
    <div className='bottom-footer bg-color-one py-8'>
      <div className='container container-lg'>
        <div className='bottom-footer__inner flex-between flex-wrap gap-16 py-16'>
          <p className='bottom-footer__text '>
            {tBF('copyright')}
          </p>
          <div className='flex-align gap-8 flex-wrap'>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomFooter;
