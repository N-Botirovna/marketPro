"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isAuthenticated, getUserProfile } from "@/services/auth";
import { openPostChooser } from "@/lib/postBookModal";
import { isProfileComplete } from "@/utils/profile";

/**
 * The single "post a book" entry-point gate, shared by every surface that can
 * start the flow (the floating FAB and the app-shell bottom tab bar).
 *
 * Gate order — keep these in sync with the backend's `profile_incomplete`
 * guard so the UX matches the server's final say:
 *   1. Not logged in        → /login?next=<current page>
 *   2. Incomplete profile    → /account?complete=book (editor auto-opens)
 *   3. Otherwise             → open the post chooser
 * A failed profile check (network) falls through to the chooser and lets the
 * backend reject if needed, rather than blocking a legitimate post.
 *
 * Returns `{ trigger, checking }` — `checking` is true while the live profile
 * lookup is in flight so callers can show a busy state.
 */
export function usePostBookAction() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(false);

  const trigger = useCallback(async () => {
    if (!isAuthenticated()) {
      const next = encodeURIComponent(pathname || "/");
      router.push(`/login?next=${next}`);
      return;
    }
    setChecking(true);
    try {
      const { user } = await getUserProfile();
      if (!isProfileComplete(user)) {
        router.push("/account?complete=book");
        return;
      }
      openPostChooser();
    } catch {
      openPostChooser();
    } finally {
      setChecking(false);
    }
  }, [router, pathname]);

  return { trigger, checking };
}

export default usePostBookAction;
