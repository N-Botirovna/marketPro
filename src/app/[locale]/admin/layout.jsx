"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getUserProfile } from "@/services/auth";
import LoadingScreen from "@/components/LoadingScreen";

// Staff-gate for the CEO/Founder dashboard. Authentication itself is handled
// by <ProtectedRoute> (root layout) because "/admin" is in PROTECTED_PAGES —
// an anonymous visitor is bounced to /login before reaching here. This layer
// adds the ROLE check: only `is_staff` users may see the dashboard. The API is
// independently enforced server-side (IsAdminUser), so this is UX, not security.
export default function AdminLayout({ children }) {
  const router = useRouter();
  const tLoad = useTranslations("Loading");
  const [state, setState] = useState("checking"); // checking | allowed

  useEffect(() => {
    let active = true;
    getUserProfile()
      .then(({ user }) => {
        if (!active) return;
        if (user?.is_staff) setState("allowed");
        else router.replace("/");
      })
      .catch(() => {
        if (active) router.replace("/");
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (state !== "allowed") {
    return <LoadingScreen title={tLoad("loading")} />;
  }
  return <>{children}</>;
}
