"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { isAuthenticated, isRefreshTokenExpired, refreshAccessToken } from "@/services/auth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PROTECTED_PAGES } from "@/config";
import LoadingScreen from "./LoadingScreen";

// useLayoutEffect on client, useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Return true iff `pathname` matches one of the protected routes. We compare
// suffixes because next-intl prepends a locale (`/uz/account`). Dynamic routes
// (e.g. `/uz/user/2`) are matched on the `/user/` segment so every id is gated.
const isPathProtected = (pathname) => {
  if (!pathname) return false;
  return PROTECTED_PAGES.some(
    (route) => pathname === route || pathname.endsWith(route) || pathname.includes(`${route}/`),
  );
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
      // Stay on the spinner while we redirect — dropping `isChecking` here
      // would render the protected children for one frame, firing their
      // data fetches (e.g. /user/<id> → 401) before navigation completes.
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
    return <LoadingScreen title={tLoad("loading")} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
