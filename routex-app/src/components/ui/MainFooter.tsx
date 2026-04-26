'use client'
import { usePathname } from 'next/navigation';
import { MagneticFooter } from "./MagneticFooter";

export function MainFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return null;

  return (
    <MagneticFooter 
      companyName="RouteX AI" 
      links={[
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Contact", href: "/contact" },
      ]}
    />
  );
}
