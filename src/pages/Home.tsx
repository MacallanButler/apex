import { Hero } from "@/components/features/Hero"
import { TrustSafety } from "@/components/features/TrustSafety"
import { BookingWidget } from "@/components/features/BookingWidget"
import { ExperienceTiers } from "@/components/features/ExperienceTiers"
import { FAQ } from "@/components/features/FAQ"
import { Gallery } from "@/components/features/Gallery"

export function Home() {
    return (
        <div className="bg-background min-h-screen">
            <Hero />
            <ExperienceTiers />
            <TrustSafety />
            <Gallery />
            <BookingWidget />
            <FAQ />
        </div>
    );
}
