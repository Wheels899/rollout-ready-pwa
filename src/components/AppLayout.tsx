"use client";

import { useAuth } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import { PageLoading } from "@/components/LoadingSpinner";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { user, isLoading } = useAuth();

  if (requireAuth && isLoading) {
    return <PageLoading />;
  }

  if (requireAuth && !user) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
