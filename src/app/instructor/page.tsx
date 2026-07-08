"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, FileCheck, CheckCircle2, AlertTriangle, CloudRain, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Booking {
  id: string;
  user_id: string;
  date: string;
  time: string;
  package: string;
  instructor: string;
  extras: string[];
  total: number;
  status?: string;
  student_email?: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingManifest, setLoadingManifest] = useState(true);

  const fetchBookings = async () => {
    setLoadingManifest(true);
    const { data } = await supabase.from("bookings").select("*");
    
    // Sort bookings by date and time
    const sorted = ((data as Booking[]) || []).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    setBookings(sorted);
    setLoadingManifest(false);
  };

  useEffect(() => {
    if (!loading) {
      if (!user || profile?.role !== "instructor") {
        router.replace("/login");
      } else {
        fetchBookings();
      }
    }
  }, [user, profile, loading, router]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    fetchBookings();
  };

  if (loading || loadingManifest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading Instructor Panel...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "Weather Delayed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
            <CloudRain className="w-3.5 h-3.5" /> Weather Delay
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
              <Users className="text-primary w-10 h-10" /> Instructor Panel
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Welcome back, <span className="text-white font-semibold">{profile?.name || "Sarah Connor"}</span>. Manage jump manifest and student completions.
            </p>
          </div>
          <Button onClick={fetchBookings} variant="outline" className="border-white/10 hover:bg-white/5">
            Refresh Manifest
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-neutral-900 border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-normal">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-normal">Pending Jumps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {bookings.filter(b => !b.status || b.status === "Scheduled").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-normal">Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">
                {bookings.filter(b => b.status === "Completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manifest Table */}
        <Card className="bg-neutral-900 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Jump Manifest</CardTitle>
            <CardDescription className="text-zinc-500">Live roster of student and guest jumps scheduled today and upcoming days.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <AlertTriangle className="w-12 h-12 mx-auto text-zinc-600" />
                <p>No bookings found in the manifest.</p>
                <p className="text-xs">Student bookings will appear here once they book using the homepage widget.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 text-sm">
                      <th className="py-4 px-4 font-semibold">Student / Guest</th>
                      <th className="py-4 px-4 font-semibold">Date & Time</th>
                      <th className="py-4 px-4 font-semibold">Experience</th>
                      <th className="py-4 px-4 font-semibold">Instructor</th>
                      <th className="py-4 px-4 font-semibold">Extras</th>
                      <th className="py-4 px-4 font-semibold">Status</th>
                      <th className="py-4 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/5 text-zinc-300 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-500" />
                            <div>
                              <span className="font-semibold text-white block">
                                {booking.student_email?.split("@")[0] || "Guest Jumper"}
                              </span>
                              <span className="text-xs text-zinc-500">{booking.student_email || "anonymous@jumper.com"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-primary" /> {booking.date}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <Clock className="w-3.5 h-3.5" /> {booking.time}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 uppercase text-xs font-semibold tracking-wider text-white">
                          {booking.package}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {booking.instructor === "any" ? "Any Available" : booking.instructor}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {booking.extras.length === 0 ? (
                              <span className="text-xs text-zinc-600">None</span>
                            ) : (
                              booking.extras.map(ex => (
                                <span key={ex} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {ex}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(!booking.status || booking.status === "Scheduled") && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateStatus(booking.id, "Completed")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(booking.id, "Weather Delayed")}
                                  className="border-white/10 hover:bg-white/5 text-xs h-8 text-amber-400"
                                >
                                  Delay
                                </Button>
                              </>
                            )}
                            {booking.status && booking.status !== "Scheduled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus(booking.id, "Scheduled")}
                                className="text-zinc-500 hover:text-white text-xs h-8"
                              >
                                Revert to Scheduled
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
