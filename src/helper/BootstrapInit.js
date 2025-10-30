"use client";
import { useEffect } from "react";
import ScrollToTop from "react-scroll-to-top";

export default function BootstrapInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
      import("select2/dist/js/select2.min.js");
    }
  }, []);

  return <ScrollToTop smooth color="#B94BF0" />;
}

