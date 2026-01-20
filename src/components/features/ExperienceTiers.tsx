import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function ExperienceTiers() {
    const tiers = [
        {
            name: "Tandem Jump",
            price: "$249",
            desc: "For your first time. Attached to an instructor.",
            features: ["15 min Briefing", "60s Freefall", "Video Option Available", "Certificate of Completion"],
            cta: "Book Tandem",
            featured: true
        },
        {
            name: "Solo Licensure",
            price: "$189",
            desc: "For licensed skydivers (USPA A-License required).",
            features: ["Gear Rental Included", "Packing Mat Available", "Brief & Debrief", "Logbook Signature"],
            cta: "Book Slot",
            featured: false
        },
        {
            name: "Sunset Gold",
            price: "$299",
            desc: "The ultimate golden hour experience.",
            features: ["Premium Time Slot", "Extra Altitude (15k ft)", "Free High-Res Photos", "Champagne Toast"],
            cta: "Book Sunset",
            featured: false
        },
        {
            name: "Weekend Warrior",
            price: "$799",
            desc: "Full weekend immersion package.",
            features: ["4 Jumps Included", "Accommodation for 2 Nights", "Dinner with Crew", "Exclusive Merch"],
            cta: "Plan Weekend",
            featured: false
        }
    ];

    return (
        <section id="experience" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-heading font-bold text-white mb-4">
                        CHOOSE YOUR <span className="text-primary">FLIGHT</span>
                    </h2>
                    <p className="text-muted-foreground">From first steps to pro jumps, we have the altitude for you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tiers.map((tier, i) => (
                        <Card key={i} className={`bg-card/50 border-white/10 hover:border-primary/50 transition-all duration-300 relative ${tier.featured ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
                            {tier.featured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-primary">{tier.price}</span>
                                    {tier.price !== "Custom" && <span className="text-sm text-muted-foreground"> / person</span>}
                                </div>
                                <CardDescription>{tier.desc}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {tier.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={tier.featured ? "default" : "outline"}>
                                    {tier.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
