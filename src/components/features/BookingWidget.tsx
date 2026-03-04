"use client";

import { useState } from 'react';
import { CloudSun, Wind, Thermometer, Check, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { useLiveWeather } from "@/hooks/useLiveWeather";
import { getSlotAvailability, getStatusColor } from "@/lib/scheduling";
import { ComplianceChecklist } from "@/components/features/ComplianceChecklist";
import { useRoleStore, hasAccess, roleColors } from "@/lib/rbac";

export function BookingWidget() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedPackage, setSelectedPackage] = useState('tandem');
    const [complianceCleared, setComplianceCleared] = useState(false);

    const weather = useLiveWeather(4000);
    const { role } = useRoleStore();
    const canBook = hasAccess(role, "Student");

    const slots = date ? getSlotAvailability(date, weather.status) : null;

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

    // Weather status colors
    const weatherBorderColor = {
        green: "border-green-500/20 bg-green-950/20",
        yellow: "border-yellow-500/20 bg-yellow-950/20",
        red: "border-red-500/20 bg-red-950/20",
    }[weather.statusColor];

    const weatherTextColor = {
        green: "text-green-400",
        yellow: "text-yellow-400",
        red: "text-red-400",
    }[weather.statusColor];

    return (
        <section className="py-20 bg-neutral-900 border-t border-white/5" id="book">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-heading font-bold text-white mb-4">
                        SECURE YOUR <span className="text-primary">DROP</span>
                    </h2>
                    <p className="text-muted-foreground">Real-time availability. Instant confirmation. No hidden fees.</p>

                    {/* Role indicator */}
                    <div className="mt-4 flex justify-center items-center gap-2 text-xs text-muted-foreground">
                        <span>Viewing as:</span>
                        <span className={cn("font-semibold px-2 py-0.5 rounded-full text-xs", roleColors[role])}>
                            {role}
                        </span>
                        {!canBook && (
                            <span className="text-amber-400">— Switch to Student or higher to unlock booking</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT: Live Weather + Slots */}
                    <div className="space-y-6">
                        <Card className={cn("border", weatherBorderColor)}>
                            <CardHeader>
                                <CardTitle className={cn("flex items-center gap-2", weatherTextColor)}>
                                    <CloudSun /> LIVE CONDITIONS
                                    <RefreshCw className="w-3 h-3 ml-auto opacity-50 animate-spin" style={{ animationDuration: "4s" }} />
                                </CardTitle>
                                <CardDescription>Updates every 4 seconds</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Wind className="text-muted-foreground w-5 h-5" /> Wind
                                    </div>
                                    <span className={cn("font-mono font-bold", weatherTextColor)}>{weather.windKts} kts</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <CloudSun className="text-muted-foreground w-5 h-5" /> Ceiling
                                    </div>
                                    <span className={cn("font-mono font-bold", weatherTextColor)}>{weather.ceilingFt.toLocaleString()} ft</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Thermometer className="text-muted-foreground w-5 h-5" /> Temp
                                    </div>
                                    <span className="font-mono font-bold text-white">{weather.tempF}°F</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Visibility</span>
                                    <span className="text-white">{weather.visibility}</span>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <Badge variant="outline" className={cn("w-full justify-center py-1", weatherTextColor, `border-current/30`)}>
                                        STATUS: {weather.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Slot availability card */}
                        {slots && (
                            <Card className="bg-neutral-900/50 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-base">Slot Availability</CardTitle>
                                    <CardDescription>{date ? format(date, "PPP") : "Select a date"}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-white">Status</span>
                                        <span className={cn("font-bold text-sm", getStatusColor(slots.status))}>
                                            {slots.status}
                                        </span>
                                    </div>
                                    {slots.maxSlots > 0 && (
                                        <>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        slots.status === "Open" ? "bg-green-500" :
                                                            slots.status === "Limited" ? "bg-yellow-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${((slots.maxSlots - slots.slotsRemaining) / slots.maxSlots) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {slots.slotsRemaining} of {slots.maxSlots} slots remaining
                                            </p>
                                        </>
                                    )}
                                    {(slots.status === "Closed" || slots.status === "Weather Hold") && (
                                        <p className="text-xs text-muted-foreground">
                                            {slots.status === "Closed" ? "Dropzone closed — no jumps on Mondays." : "Operations suspended due to weather conditions."}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* MIDDLE: Calendar */}
                    <Card className="bg-card border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Select Date</CardTitle>
                            <CardDescription>Mondays are maintenance days (closed)</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border border-white/10"
                                disabled={(d) => d.getDay() === 1 || d < new Date()}
                            />
                        </CardContent>
                    </Card>

                    {/* RIGHT: Compliance gate OR booking form */}
                    {!canBook ? (
                        <Card className="bg-card border-white/10 flex flex-col items-center justify-center p-8 text-center gap-4 h-full">
                            <div className="text-5xl">🔒</div>
                            <h3 className="text-xl font-bold text-white">Booking Restricted</h3>
                            <p className="text-sm text-muted-foreground">
                                You are viewing as <strong className="text-white">{role}</strong>. Switch your role to <strong className="text-primary">Student</strong> or higher to access the booking form.
                            </p>
                            <p className="text-xs text-muted-foreground">Use the role switcher in the navbar.</p>
                        </Card>
                    ) : !complianceCleared ? (
                        <ComplianceChecklist onComplete={() => setComplianceCleared(true)} />
                    ) : (
                        <Card className="bg-card border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Booking Summary</CardTitle>
                                <CardDescription>{date ? format(date, "PPP") : "Select a date"}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Package */}
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

                                {/* Instructor-only: manifest note */}
                                {hasAccess(role, "Instructor") && (
                                    <div className="text-xs p-2 rounded bg-amber-900/20 border border-amber-500/20 text-amber-300">
                                        📋 Instructor view: This booking will appear on today's manifest.
                                    </div>
                                )}
                                {hasAccess(role, "Admin") && (
                                    <div className="text-xs p-2 rounded bg-rose-900/20 border border-rose-500/20 text-rose-300">
                                        🔑 Admin: Override booking slots available regardless of availability status.
                                    </div>
                                )}

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-muted-foreground">Total</span>
                                        <span className="text-3xl font-heading font-bold text-primary">${totalPrice}</span>
                                    </div>
                                    <Button
                                        className="w-full h-12 text-lg font-bold"
                                        disabled={slots?.status === "Full" || slots?.status === "Weather Hold" || slots?.status === "Closed"}
                                    >
                                        {slots?.status === "Full" ? "Date Fully Booked" :
                                            slots?.status === "Weather Hold" ? "Weather Hold — Try Another Date" :
                                                slots?.status === "Closed" ? "Closed on Mondays" :
                                                    "CONFIRM BOOKING"}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-4">
                                        You won't be charged until jump day.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    )
}
