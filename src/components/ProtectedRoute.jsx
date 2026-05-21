"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { isAuthenticated, isRefreshTokenExpired, refreshAccessToken } from "@/services/auth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PROTECTED_PAGES } from "@/config";
import Spin from "./Spin";

// useLayoutEffect on client, useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Return true iff `pathname` ends with one of the protected route prefixes.
// We compare suffixes because next-intl prepends a locale (`/uz/account`).
const isPathProtected = (pathname) => {
  if (!pathname) return false;
  return PROTECTED_PAGES.some((route) => pathname === route || pathname.endsWith(route));
};

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const tLoad = useTranslations("Loading");
  const pathname = usePathname();
  const requiresAuth = isPathProtected(pathname);

  // Default: not checking — anonymous browsing is the common case. Only the
  // small protected-page slice spends time on the gate.
  const [isChecking, setIsChecking] = useState(requiresAuth);
  const refreshingRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!requiresAuth) {
      // Anonymous visitors are welcome — drop straight through.
      setIsChecking(false);
      return;
    }

    if (isAuthenticated()) {
      setIsChecking(false);
      return;
    }

    if (isRefreshTokenExpired()) {
      setIsChecking(false);
      router.push("/login");
      return;
    }

    if (!refreshingRef.current) {
      refreshingRef.current = true;
      refreshAccessToken()
        .then(() => setIsChecking(false))
        .catch(() => {
          router.push("/login");
        })
        .finally(() => {
          refreshingRef.current = false;
        });
    }
  }, [pathname, requiresAuth, router]);

  if (isChecking) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "var(--surface-page)",
          zIndex: 9999,
        }}
      >
        <Spin text={tLoad("loading")} />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
