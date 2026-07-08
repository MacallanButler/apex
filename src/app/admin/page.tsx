"use client";

import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { AdminSlotManager } from "@/components/features/AdminSlotManager";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        setProfile(profileData);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, profile, loading, router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-10">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      {profile?.role === "admin" && <AdminSlotManager />}
    </div>
  );
}