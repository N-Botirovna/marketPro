"use client";
import { useEffect, useState } from "react";

const Preloader = () => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (document.readyState === "complete") {
      setActive(false);
      return;
    }
    const handleLoad = () => setActive(false);
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  if (!active) return null;

  return (
    <div
      className="preloader"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        zIndex: 10000,
      }}
    >
      <img
        src="/assets/images/icon/preloader.gif"
        alt="Loading"
        width={80}
        height={80}
      />
    </div>
  );
};

export default Preloader;
