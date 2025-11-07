"use client";
import React from "react";
import { useTranslations } from "next-intl";

const ShippingOne = () => {
  const tShipping = useTranslations("Shipping");
  const features = [
    {
      icon: "ph-fill ph-car-profile",
      title: tShipping("freeDeliveryTitle"),
      desc: tShipping("freeDeliveryDesc"),
    },
    {
      icon: "ph-fill ph-hand-heart",
      title: tShipping("customerSatisfactionTitle"),
      desc: tShipping("customerSatisfactionDesc"),
    },
    {
      icon: "ph-fill ph-credit-card",
      title: tShipping("securePaymentTitle"),
      desc: tShipping("securePaymentDesc"),
    },
    {
      icon: "ph-fill ph-chats",
      title: tShipping("supportTitle"),
      desc: tShipping("supportDesc"),
    },
  ];

  return (
    <section className="shipping mb-24 mt-16" id="shipping">
      <div className="container container-lg">
        <div className="row gy-4">
          {features.map(({ icon, title, desc }, index) => (
            <div key={index} className="col-xxl-3 col-sm-6">
              <div className="shipping-item flex-align gap-16 rounded-16 bg-main-50 hover-bg-main-100 transition-2">
                <span className="w-56 h-56 flex-center rounded-circle bg-main-600 text-white text-32 flex-shrink-0">
                  <i className={icon} />
                </span>
                <div className="">
                  <h6 className="mb-0">{title}</h6>
                  <span className="text-sm text-heading">
                    {desc}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShippingOne;
