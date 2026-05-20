"use client";
import { usePathname } from "@/i18n/navigation";
import { PUBLIC_PAGES } from "@/config";
import HeaderOne from "./HeaderOne";

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (PUBLIC_PAGES.includes(pathname)) return null;
  return <HeaderOne />;
}
