"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login, profile, user, loading: authLoading } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle automatic redirection based on role once authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === "admin") {
        router.replace("/admin");
      } else if (profile.role === "instructor") {
        router.replace("/instructor");
      } else {
        router.replace("/");
      }
    }
  }, [user, profile, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await login(email);
      setMessage("Login successful! Redirecting...");
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6 animate-fade-in"
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
            className="w-full bg-neutral-950 border-white/10 text-white"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full text-base py-5 font-bold font-heading uppercase tracking-wider">
          {loading ? "Redirecting..." : "Sign In"}
        </Button>

        {message && <p className="text-sm text-primary text-center font-semibold">{message}</p>}

        <div className="border-t border-white/5 pt-4 text-xs text-zinc-500 space-y-1">
          <p className="font-semibold text-zinc-400">Demo Accounts (instant login):</p>
          <p>• Admin: <code className="text-primary font-bold">admin@apex.com</code></p>
          <p>• Instructor: <code className="text-primary font-bold">instructor@apex.com</code></p>
          <p>• Student/Guest: <code className="text-primary font-bold">student@apex.com</code> (or any other email)</p>
        </div>
      </form>
    </div>
  );
}