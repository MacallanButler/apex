import { Hero } from "@/components/features/Hero";
import { TrustSafety } from "@/components/features/TrustSafety";
import { BookingWidget } from "@/components/features/BookingWidget";
import { ExperienceTiers } from "@/components/features/ExperienceTiers";
import { FAQ } from "@/components/features/FAQ";
import { Gallery } from "@/components/features/Gallery";
import { AdminSlotManager } from "@/components/features/AdminSlotManager";
import { useUser } from "@/lib/UserContext";

export default function Home() {
  const { user, profile, loading } = useUser();
  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <ExperienceTiers />
      <TrustSafety />
      <Gallery />
      {profile?.role === "admin" && <AdminSlotManager />}
      <BookingWidget />
      <FAQ />
    </div>
  );
}