"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle automatic redirection based on role
  useEffect(() => {
    const checkUserAndRedirect = async (session: any) => {
      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = (profileData as any)?.role;
        if (role === "admin") {
          router.replace("/admin");
        } else if (role === "instructor") {
          router.replace("/instructor");
        } else {
          router.replace("/");
        }
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) checkUserAndRedirect(session);
    });

    // Check current session
    supabase.auth.getUser().then(({ data }: any) => {
      if (data?.user) {
        supabase.from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profileData }: any) => {
            const role = profileData?.role;
            if (role === "admin") router.replace("/admin");
            else if (role === "instructor") router.replace("/instructor");
            else router.replace("/");
          });
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Login successful! Redirecting...");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6"
      >
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Login</h1>
        <p className="text-zinc-400 text-sm">Sign in to book a jump or view your dashboard.</p>

        <div className="space-y-2">
          <label className="block text-zinc-300 text-sm font-semibold">Email Address</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full text-base py-5">
          {loading ? "Redirecting..." : "Sign In"}
        </Button>

        {message && <p className="text-sm text-primary text-center">{message}</p>}

        <div className="border-t border-white/5 pt-4 text-xs text-zinc-500 space-y-1">
          <p className="font-semibold text-zinc-400">Demo Accounts (instant login):</p>
          <p>• Admin: <code className="text-primary">admin@apex.com</code></p>
          <p>• Instructor: <code className="text-primary">instructor@apex.com</code></p>
          <p>• Student/Guest: <code className="text-primary">student@apex.com</code> (or any other email)</p>
        </div>
      </form>
    </div>
  );
}