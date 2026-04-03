"use client";

import { useState } from 'react';
import { CloudSun, Wind, Thermometer, Check, RefreshCw, ChevronRight, CheckCircle2, User, Users } from 'lucide-react';
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

const steps = [
    { id: 1, name: "Date" },
    { id: 2, name: "Package" },
    { id: 3, name: "Instructor" },
    { id: 4, name: "Compliance" },
    { id: 5, name: "Confirm" }
];

export function BookingWidget() {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedPackage, setSelectedPackage] = useState('tandem');
    const [selectedInstructor, setSelectedInstructor] = useState('any');
    const [complianceCleared, setComplianceCleared] = useState(false);

    const weather = useLiveWeather(4000);
    const { role } = useRoleStore();
    
    // Everyone can book now, even Guests
    const canBook = true;

    const slots = date ? getSlotAvailability(date, weather.status) : null;

    const packages = {
        tandem: { price: 249, name: "Tandem Jump", desc: "For your first time. Attached to an instructor." },
        solo: { price: 189, name: "Solo License Jump", desc: "For licensed skydivers." },
        sunset: { price: 299, name: "Sunset Gold Jump", desc: "Premium experience at golden hour." }
    };

    const extras = [
        { id: 'video', name: 'Handcam Video', price: 99 },
        { id: 'photos', name: 'High-Res Photos', price: 79 },
        { id: 'insurance', name: 'Jump Insurance', price: 29 }
    ];

    const instructors = [
        { id: 'any', name: 'Any Available (Recommended)' },
        { id: 'sarah', name: "Sarah 'Hawk' Connor" },
        { id: 'mike', name: "Mike 'Drop' Johnson" },
        { id: 'elena', name: "Elena Rodriguez" },
    ];

    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const toggleExtra = (id: string) => {
        setSelectedExtras(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const totalPrice = packages[selectedPackage as keyof typeof packages].price +
        selectedExtras.reduce((acc, curr) => acc + (extras.find(e => e.id === curr)?.price || 0), 0);

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

    const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <section className="py-20 bg-neutral-900 border-t border-white/5" id="book">
            <div className="container mx-auto px-4 max-w-5xl">
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
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full" />
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / 4) * 100}%` }}
                        />
                        {steps.map((s, i) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                                    step >= s.id ? "bg-primary text-white" : "bg-neutral-800 text-muted-foreground border border-white/10"
                                )}>
                                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold absolute -bottom-6 whitespace-nowrap",
                                    step >= s.id ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {s.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 bg-card border border-white/10 rounded-2xl p-6 md:p-8">
                    
                    {/* STEP 1: DATE & WEATHER */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-bold text-white mb-6">Choose Your Date</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="w-full"
                                            classNames={{
                                                months: "w-full",
                                                month: "w-full",
                                                table: "w-full border-collapse space-y-1",
                                                head_row: "flex w-full justify-between",
                                                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                                row: "flex w-full mt-2 justify-between",
                                            }}
                                            disabled={(d) => d.getDay() === 1 || d < new Date()}
                                        />
                                    </div>
                                </div>
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
                                            <div className="pt-4 border-t border-white/10">
                                                <Badge variant="outline" className={cn("w-full justify-center py-1", weatherTextColor, `border-current/30`)}>
                                                    STATUS: {weather.status}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {slots && (
                                        <Card className="bg-neutral-900/50 border-white/10">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm text-white">Slot Availability</span>
                                                    <span className={cn("font-bold text-sm", getStatusColor(slots.status))}>
                                                        {slots.status}
                                                    </span>
                                                </div>
                                                {slots.maxSlots > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {slots.slotsRemaining} of {slots.maxSlots} slots remaining
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button 
                                    size="lg" 
                                    onClick={nextStep} 
                                    disabled={!date || slots?.status === "Full" || slots?.status === "Closed"}
                                >
                                    Next: Choose Experience <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PACKAGE & EXTRAS */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-bold text-white mb-6">Select Your Package</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Experience Level</label>
                                    {Object.entries(packages).map(([key, pkg]) => (
                                        <div
                                            key={key}
                                            className={cn(
                                                "cursor-pointer p-4 rounded-xl border-2 transition-all",
                                                selectedPackage === key
                                                    ? "bg-primary/10 border-primary text-white"
                                                    : "bg-neutral-900/50 border-white/10 hover:border-white/30 text-muted-foreground"
                                            )}
                                            onClick={() => setSelectedPackage(key)}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-lg">{pkg.name}</span>
                                                <span className="font-bold text-white">${pkg.price}</span>
                                            </div>
                                            <p className="text-sm opacity-80">{pkg.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Add-ons</label>
                                    {extras.map(extra => (
                                        <div
                                            key={extra.id}
                                            className={cn(
                                                "cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between",
                                                selectedExtras.includes(extra.id) 
                                                    ? "bg-primary/20 border-primary text-white" 
                                                    : "bg-neutral-900/50 border-white/10 hover:bg-white/5 text-muted-foreground"
                                            )}
                                            onClick={() => toggleExtra(extra.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center", selectedExtras.includes(extra.id) ? "bg-primary border-primary" : "border-white/30")}>
                                                    {selectedExtras.includes(extra.id) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="font-medium">{extra.name}</span>
                                            </div>
                                            <span className="font-semibold text-white">+${extra.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8 flex justify-between">
                                <Button variant="outline" onClick={prevStep}>Back</Button>
                                <Button size="lg" onClick={nextStep}>Next: Instructor Options <ChevronRight className="w-4 h-4 ml-2" /></Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: INSTRUCTOR PREFERENCE */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-bold text-white mb-6">Instructor Preference</h3>
                            <p className="text-muted-foreground mb-8">Unless you have a specific request, we will pair you with the best instructor available for your slot.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {instructors.map(inst => (
                                    <div
                                        key={inst.id}
                                        className={cn(
                                            "cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                                            selectedInstructor === inst.id
                                                ? "bg-primary/10 border-primary text-white"
                                                : "bg-neutral-900/50 border-white/10 hover:border-white/30 text-muted-foreground"
                                        )}
                                        onClick={() => setSelectedInstructor(inst.id)}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center border border-white/5">
                                            {inst.id === 'any' ? <Users className="w-6 h-6 text-primary" /> : <User className="w-6 h-6 text-muted-foreground" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{inst.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button variant="outline" onClick={prevStep}>Back</Button>
                                <Button size="lg" onClick={nextStep}>Next: Safety Requirements <ChevronRight className="w-4 h-4 ml-2" /></Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: COMPLIANCE */}
                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                            <ComplianceChecklist onComplete={() => {
                                setComplianceCleared(true);
                                nextStep();
                            }} />
                            <div className="mt-6 flex justify-between">
                                <Button variant="outline" onClick={prevStep}>Back</Button>
                                {/* Next button is handled inside ComplianceChecklist initially, but we allow manual progress if already cleared */}
                                {complianceCleared && (
                                    <Button onClick={nextStep}>Skip to Confirm <ChevronRight className="w-4 h-4 ml-2" /></Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 5: CONFIRM */}
                    {step === 5 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">Review & Confirm</h3>
                                <p className="text-muted-foreground">You won't be charged until jump day.</p>
                            </div>

                            <Card className="bg-neutral-900/50 border-white/10 mb-8">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between pb-4 border-b border-white/10">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="text-white font-medium">{date ? format(date, "PPP") : ""}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b border-white/10">
                                        <span className="text-muted-foreground">Experience</span>
                                        <span className="text-white font-medium">{packages[selectedPackage as keyof typeof packages].name}</span>
                                    </div>
                                    <div className="flex justify-between pb-4 border-b border-white/10">
                                        <span className="text-muted-foreground">Instructor</span>
                                        <span className="text-white font-medium">{instructors.find(i => i.id === selectedInstructor)?.name}</span>
                                    </div>
                                    {selectedExtras.length > 0 && (
                                        <div className="flex justify-between pb-4 border-b border-white/10">
                                            <span className="text-muted-foreground">Add-ons</span>
                                            <div className="text-right">
                                                {selectedExtras.map(id => (
                                                    <div key={id} className="text-white text-sm">
                                                        + {extras.find(e => e.id === id)?.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-lg font-medium text-white">Total Estimate</span>
                                        <span className="text-3xl font-heading font-bold text-primary">${totalPrice}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {hasAccess(role, "Instructor") && (
                                <div className="mb-6 text-xs p-3 rounded-lg bg-amber-900/20 border border-amber-500/20 text-amber-300 text-center">
                                    📋 Instructor view: This booking will appear on today's manifest.
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button variant="outline" className="w-full flex-1" onClick={prevStep}>Back</Button>
                                <Button size="lg" className="w-full flex-2 font-bold text-lg text-white">CONFIRM BOOKING</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
