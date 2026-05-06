"use client";
import { usePathname } from "@/i18n/navigation";
import HeaderOne from "./HeaderOne";
import { PUBLIC_PAGES } from "@/config";

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (PUBLIC_PAGES.includes(pathname)) return null;
  return <HeaderOne />;
}
