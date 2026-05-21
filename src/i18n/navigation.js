import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// `permanentRedirect` is the 308 variant — preserves method, transfers
// link equity. Use it for legacy URL retirements so backlinks pointing
// at the old shape still pass PageRank to the canonical one. Reserve
// `redirect` (307) for genuinely temporary bounces (e.g. login bounce
// that should not signal a permanent move).
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
