"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const Preloader = () => {
  const [active, setActive] = useState(true);
  
  useEffect(() => {
    // Quick timeout to prevent long loading
    const timeout = setTimeout(() => {
      setActive(false);
    }, 1000); // Max 1 second

    // Wait for DOM to fully load
    const handleLoad = () => {
      clearTimeout(timeout);
      setActive(false);
    };

    if (document.readyState === "complete") {
      clearTimeout(timeout);
      setActive(false);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (!active) return null;

  return (
    <div className='preloader' style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 10000 }}>
      <Image 
        src='/assets/images/icon/preloader.gif' 
        alt='Loading' 
        width={80} 
        height={80}
        priority
        unoptimized
      />
    </div>
  );
};

export default Preloader;
