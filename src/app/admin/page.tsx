"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { AdminSlotManager } from "@/components/features/AdminSlotManager";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-10 pt-24 text-white">
      <h1 className="text-4xl font-heading font-bold text-white mb-6">Admin Dashboard</h1>
      {profile?.role === "admin" && <AdminSlotManager />}
    </div>
  );
}