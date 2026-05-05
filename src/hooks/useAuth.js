import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAuthToken,
  isTokenExpired,
  isRefreshTokenExpired,
  refreshAccessToken,
  logoutUser,
} from '@/services/auth';
import { getItem } from '@/utils/storage';

const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') console.log(...args);
};

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const abortRef = useRef(null);

  const checkAuthStatus = useCallback(async () => {
    // Abort any in-flight check before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    // Single logout path — avoids 3 separate logoutUser + setState blocks
    async function doLogout() {
      await logoutUser();
      if (signal.aborted) return;
      setToken(null);
      setIsAuth(false);
    }

    try {
      if (isRefreshTokenExpired()) {
        devLog('⚠️ Refresh token expired, logging out...');
        await doLogout();
        return;
      }

      const currentToken = getAuthToken();

      if (!currentToken) {
        const refreshToken = getItem('refresh_token');
        if (refreshToken && !isRefreshTokenExpired()) {
          devLog('⚠️ No access token, but refresh token exists. Refreshing...');
          try {
            await refreshAccessToken();
            if (signal.aborted) return;
            setToken(getAuthToken());
            setIsAuth(true);
          } catch {
            devLog('❌ Refresh failed, logging out...');
            await doLogout();
          }
        } else {
          if (signal.aborted) return;
          setToken(null);
          setIsAuth(false);
        }
        return;
      }

      if (isTokenExpired()) {
        devLog('⚠️ Access token expired on load, refreshing...');
        try {
          await refreshAccessToken();
          if (signal.aborted) return;
          setToken(getAuthToken());
          setIsAuth(true);
        } catch {
          await doLogout();
        }
      } else {
        if (signal.aborted) return;
        setToken(currentToken);
        setIsAuth(true);
      }
    } catch (error) {
      devLog('Error checking auth status:', error);
      if (signal.aborted) return;
      setToken(null);
      setIsAuth(false);
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Abort any in-flight auth check to prevent state conflicts
    abortRef.current?.abort();
    try {
      await logoutUser();
      setToken(null);
      setIsAuth(false);
    } catch (error) {
      devLog('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
    return () => abortRef.current?.abort();
  }, [checkAuthStatus]);

  return {
    isAuthenticated: isAuth,
    isLoading,
    token,
    logout,
    refreshAuth: checkAuthStatus,
  };
};
