import { useState } from 'react';
import { CloudSun, Wind, Thermometer, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from "date-fns"

export function BookingWidget() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedPackage, setSelectedPackage] = useState('tandem');

    const packages = {
        tandem: { price: 249, name: "Tandem Jump" },
        solo: { price: 189, name: "Solo License Jump" },
        sunset: { price: 299, name: "Sunset Gold Jump" }
    };

    const extras = [
        { id: 'video', name: 'Handcam Video', price: 99 },
        { id: 'photos', name: 'High-Res Photos', price: 79 },
        { id: 'insurance', name: 'Jump Insurance', price: 29 }
    ];

    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

    const toggleExtra = (id: string) => {
        setSelectedExtras(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const totalPrice = packages[selectedPackage as keyof typeof packages].price +
        selectedExtras.reduce((acc, curr) => acc + (extras.find(e => e.id === curr)?.price || 0), 0);

    return (
        <section className="py-20 bg-neutral-900 border-t border-white/5" id="book">
            <div className="container mx-auto px-4">

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-heading font-bold text-white mb-4">
                        SECURE YOUR <span className="text-primary">DROP</span>
                    </h2>
                    <p className="text-muted-foreground">Real-time availability. Instant confirmation. No hidden fees.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Weather Widget (Left) */}
                    <div className="space-y-6">
                        <Card className="bg-blue-950/30 border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-400">
                                    <CloudSun /> LIVE CONDITIONS
                                </CardTitle>
                                <CardDescription>Dropzone: Skydive Apex</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Wind className="text-muted-foreground w-5 h-5" /> Wind
                                    </div>
                                    <span className="font-mono font-bold text-green-400">5 kts (Good)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <CloudSun className="text-muted-foreground w-5 h-5" /> Ceiling
                                    </div>
                                    <span className="font-mono font-bold text-green-400">12,000 ft</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Thermometer className="text-muted-foreground w-5 h-5" /> Temp
                                    </div>
                                    <span className="font-mono font-bold text-white">72°F</span>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 w-full justify-center py-1">
                                        STATUS: GREEN - GO FOR JUMP
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-orange-950/10 border-orange-500/20">
                            <CardHeader>
                                <CardTitle className="text-orange-400 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Pricing Transparency</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>• Prices include gear rental & instructor fee.</p>
                                <p>• USPA Membership required for Solo Jumps.</p>
                                <p>• Full refund if weather prevents jump.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Calendar (Center) */}
                    <Card className="bg-card border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Select Date</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border border-white/10"
                            />
                        </CardContent>
                    </Card>

                    {/* Booking Form (Right) */}
                    <Card className="bg-card border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Booking Summary</CardTitle>
                            <CardDescription>{date ? format(date, "PPP") : "Select a date"}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Package Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Experience Level</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(packages).map(([key, pkg]) => (
                                        <div
                                            key={key}
                                            className={cn(
                                                "cursor-pointer p-3 rounded-md border transition-all flex justify-between items-center",
                                                selectedPackage === key
                                                    ? "bg-primary/20 border-primary text-white"
                                                    : "bg-transparent border-white/10 hover:border-white/30 text-muted-foreground"
                                            )}
                                            onClick={() => setSelectedPackage(key)}
                                        >
                                            <span className="font-bold">{pkg.name}</span>
                                            <span>${pkg.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Extras */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Add-ons</label>
                                <div className="space-y-2">
                                    {extras.map(extra => (
                                        <div
                                            key={extra.id}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded border cursor-pointer select-none",
                                                selectedExtras.includes(extra.id) ? "border-primary bg-primary/10 text-white" : "border-white/10 text-muted-foreground hover:bg-white/5"
                                            )}
                                            onClick={() => toggleExtra(extra.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {selectedExtras.includes(extra.id) && <Check className="w-4 h-4 text-primary" />}
                                                <span>{extra.name}</span>
                                            </div>
                                            <span>+${extra.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="text-3xl font-heading font-bold text-primary">${totalPrice}</span>
                                </div>
                                <Button className="w-full h-12 text-lg font-bold">
                                    CONFIRM BOOKING
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    You won't be charged until jump day.
                                </p>
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    )
}
