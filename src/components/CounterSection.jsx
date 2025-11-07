"use client";
import React from "react";
import { useTranslations } from "next-intl";

const CounterSection = () => {
  const tCounter = useTranslations("Counter");
  const stats = [
    {
      value: tCounter("storesValue"),
      label: tCounter("storesLabel"),
    },
    {
      value: tCounter("productsValue"),
      label: tCounter("productsLabel"),
    },
    {
      value: tCounter("usersValue"),
      label: tCounter("usersLabel"),
    },
    {
      value: tCounter("brandsValue"),
      label: tCounter("brandsLabel"),
    },
  ];

  return (
    <section className='counter'>
      <div className='container container-lg'>
        <div className='row justify-content-center'>
          <div className='col-xxl-11'>
            <div className='bg-neutral-600 rounded-16 px-xxl-5 px-xl-4'>
              <div className='row gy-lg-0 gy-4 line-wrapper'>
                {stats.map(({ value, label }, index) => (
                  <div key={index} className='col-lg-3 col-sm-6 col-xs-6'>
                    <div className='counter-item text-center py-100 px-8'>
                      <h3 className='text-main-600 counter mb-8 fw-semibold'>
                        {value}
                      </h3>
                      <p className='text-white text-xl font-heading-two fw-semibold'>
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
