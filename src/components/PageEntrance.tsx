"use client";

import { usePathname } from "next/navigation";

interface PageEntranceProps {
  children: React.ReactNode;
}

export function PageEntrance({ children }: PageEntranceProps) {
  const pathname = usePathname();

  return (
    <>
      <div key={pathname} className="site-entry-gradient" aria-hidden="true" />
      {children}
    </>
  );
}
