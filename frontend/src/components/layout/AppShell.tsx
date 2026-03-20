"use client";

import { usePathname } from "next/navigation";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { MainFooter } from "@/components/layout/MainFooter";
import { MainHeader } from "@/components/layout/MainHeader";
import { AuthProvider } from "@/context/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/admin-auth");

  if (isAdminRoute) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <MainHeader />
      {children}
      <MainFooter />
      <FloatingChat />
    </AuthProvider>
  );
}
