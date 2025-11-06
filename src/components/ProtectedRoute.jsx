"use client";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/services/auth";
import { useTranslations } from "next-intl";
import Spin from "./Spin";
import { usePathname, useRouter } from "@/i18n/navigation";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const tLoad = useTranslations('Loading');
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Pages that don't require authentication
  const publicPages = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to prevent flickering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsLoading(false);
      setIsChecking(false);

      // If not authenticated and not on a public page, redirect to login
      if (!authenticated && !isPublicPage) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, pathname, isPublicPage]);

  // Always show loading spinner for protected pages during initial check
  if (isChecking || (isLoading && !isPublicPage)) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ 
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#fff',
          zIndex: 9999
        }}
      >
        <Spin text={tLoad('loading')} />
      </div>
    );
  }

  // If not authenticated and not on public page, don't render children
  if (!isAuth && !isPublicPage) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ 
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#fff',
          zIndex: 9999
        }}
      >
        <Spin text={tLoad('redirecting')} />
      </div>
    );
  }

  // Render children for authenticated users or public pages
  return <>{children}</>;
};

export default ProtectedRoute;
