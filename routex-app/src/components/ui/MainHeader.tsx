'use client'
import { usePathname } from 'next/navigation';
import { HolographicNav } from "./HolographicNav";

export function MainHeader() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return null;

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/#solutions" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/dashboard/analytics" },
    { name: "Login", href: "/auth/login" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <HolographicNav items={navItems} className="rounded-full shadow-2xl" />
    </header>
  );
}
