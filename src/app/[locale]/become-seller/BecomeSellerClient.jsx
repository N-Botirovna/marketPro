"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import WhyBecomeSeller from "@/components/WhyBecomeSeller";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const CounterSection = dynamic(() => import("@/components/CounterSection"));
const StepsSection = dynamic(() => import("@/components/StepsSection"));
const ShippingOne = dynamic(() => import("@/components/ShippingOne"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));
const SellerRegistrationModal = dynamic(() => import("@/components/SellerRegistrationModal"));

const BecomeSellerClient = () => {
  const tSeller = useTranslations("SellerRegistration");
  const [showModal, setShowModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#FA6400" />

      {/* WhyBecomeSeller */}
      <WhyBecomeSeller />

      {/* CounterSection */}
      <CounterSection />

      {/* StepsSection */}
      <StepsSection />

      {/* ShippingOne */}
      <ShippingOne />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />

      {/* Floating CTA Button */}
      {showFloatingButton && (
        <div
          className="position-fixed"
          style={{
            bottom: "30px",
            right: "30px",
            zIndex: 999,
            animation: "fadeInUp 0.5s ease",
          }}
        >
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-main-two rounded-pill px-40 py-16 fw-bold"
            style={{
              fontSize: "18px",
              boxShadow: "0 8px 32px rgba(250, 100, 0, 0.4)",
              border: "none",
            }}
          >
            <i className="ph ph-user-plus me-8"></i>
            {tSeller("createAccountButton")}
          </button>
        </div>
      )}

      {/* Seller Registration Modal */}
      <SellerRegistrationModal
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </>
  );
};

export default BecomeSellerClient;
