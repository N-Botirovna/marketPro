"use client";
import { useEffect } from "react";
import ScrollToTop from "react-scroll-to-top";
export default function BootstrapInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
      require("select2/dist/js/select2.min.js");
    }
  }, []);
  return (
    <>
      <ScrollToTop smooth color='#B94BF0' />
    </>
  );
}
