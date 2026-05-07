"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isAuthenticated, isRefreshTokenExpired, refreshAccessToken } from "@/services/auth";
import { useTranslations } from "next-intl";
import Spin from "./Spin";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PUBLIC_PAGES } from "@/config";

// useLayoutEffect on client, useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const tLoad = useTranslations('Loading');
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  // Start as "checking" — resolved synchronously before first paint via useLayoutEffect
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const refreshingRef = useRef(false);

  // Runs synchronously before browser paint — no spinner flash for authenticated users
  useIsomorphicLayoutEffect(() => {
    if (isPublicPage) {
      setIsAuth(true);
      setIsChecking(false);
      return;
    }

    if (isRefreshTokenExpired()) {
      setIsChecking(false);
      router.push('/login');
      return;
    }

    if (isAuthenticated()) {
      setIsAuth(true);
      setIsChecking(false);
      return;
    }

    // Rare: has refresh token but no access token — async refresh
    if (!refreshingRef.current) {
      refreshingRef.current = true;
      refreshAccessToken()
        .then(() => {
          setIsAuth(true);
          setIsChecking(false);
          refreshingRef.current = false;
        })
        .catch(() => {
          setIsChecking(false);
          refreshingRef.current = false;
          router.push('/login');
        });
    }
  }, [pathname, isPublicPage, router]);

  // Only show spinner when actually refreshing token (rare case)
  if (isChecking && !isAuth) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, backgroundColor: '#fff', zIndex: 9999 }}
      >
        <Spin text={tLoad('loading')} />
      </div>
    );
  }

  if (!isAuth && !isPublicPage) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
