"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/services/auth";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Pages that don't require authentication
  const publicPages = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsLoading(false);

      // If not authenticated and not on a public page, redirect to login
      if (!authenticated && !isPublicPage) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, pathname, isPublicPage]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and not on public page, don't render children
  if (!isAuth && !isPublicPage) {
    return null;
  }

  // Render children for authenticated users or public pages
  return children;
};

export default ProtectedRoute;
