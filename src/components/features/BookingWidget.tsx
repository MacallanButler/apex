"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, CalendarIcon, UserIcon, ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComplianceChecklist } from "@/components/features/ComplianceChecklist";
import { useUser } from "@/lib/UserContext";

interface Slot {
  id: string;
  time: string;
  capacity: number;
  remaining?: number;
}

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

export function BookingWidget() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("tandem");
  const [selectedInstructor, setSelectedInstructor] = useState("any");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [complianceCleared, setComplianceCleared] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  const packages = {
    tandem: { price: 249, name: "Tandem Jump", desc: "First time, attached to instructor." },
    solo: { price: 189, name: "Solo Jump", desc: "Licensed skydivers only." },
    sunset: { price: 299, name: "Sunset Jump", desc: "Golden hour premium." },
  };

  const extras = [
    { id: "video", name: "Handcam Video", price: 99 },
    { id: "photos", name: "Photos", price: 79 },
    { id: "insurance", name: "Insurance", price: 29 },
  ];

  const instructors = [
    { id: "any", name: "Any Available" },
    { id: "sarah", name: "Sarah Connor" },
    { id: "mike", name: "Mike Johnson" },
  ];

  const totalPrice =
    packages[selectedPackage as keyof typeof packages].price +
    selectedExtras.reduce(
      (acc, curr) => acc + (extras.find(e => e.id === curr)?.price || 0),
      0
    );

  const toggleExtra = (id: string) =>
    setSelectedExtras(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // 🔹 Fetch available slots for selected date (accessible to guests)
  useEffect(() => {
    const fetchSlots = async () => {
      if (!date) return;
      setLoadingSlots(true);
      const formatted = format(date, "yyyy-MM-dd");

      const { data: slotData } = await supabase
        .from("time_slots")
        .select("*")
        .eq("date", formatted);

      const { data: bookingData } = await supabase
        .from("bookings")
        .select("time")
        .eq("date", formatted);

      const computed =
        (slotData as Slot[])?.map(slot => {
          const taken = (bookingData as Booking[])?.filter(b => b.time === slot.time).length ?? 0;
          return { ...slot, remaining: slot.capacity - taken };
        }) || [];

      setSlots(computed);
      setLoadingSlots(false);
    };

    fetchSlots();
  }, [date]);

  const handleConfirm = async () => {
    if (!date || !selectedTime) return;

    setSubmitting(true);
    let currentUser = user;

    // If guest, sign up/login first
    if (!currentUser) {
      if (!guestEmail) {
        alert("Please enter your email to proceed.");
        setSubmitting(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithOtp({ email: guestEmail });
      if (signInError) {
        alert(`Error signing in: ${signInError.message}`);
        setSubmitting(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      currentUser = userData?.user;
    }

    if (!currentUser) {
      alert("Failed to authenticate session.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: currentUser.id,
      student_email: currentUser.email,
      date: format(date, "yyyy-MM-dd"),
      time: selectedTime,
      package: selectedPackage,
      instructor: selectedInstructor,
      extras: selectedExtras,
      total: totalPrice,
      status: "Scheduled"
    });
    
    setSubmitting(false);

    if (!error) {
      alert("Booking confirmed! Welcome to Apex Drop.");
      window.location.reload(); // Reload to sync navbar session
    } else {
      alert("Error confirming booking.");
    }
  };

  return (
    <section id="book" className="py-24 bg-neutral-950 text-white border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        
        {/* Step Progress Bar */}
        <div className="flex justify-between items-center max-w-md mx-auto mb-12">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border",
                  step >= s
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-zinc-900 border-white/10 text-zinc-500"
                )}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={cn(
                    "h-[2px] w-8 md:w-16 transition-colors",
                    step > s ? "bg-primary" : "bg-zinc-800"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: DATE & TIME */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-3xl font-heading font-bold flex items-center gap-2">
                <CalendarIcon className="text-primary w-8 h-8" /> Choose Date
              </h3>
              <p className="text-zinc-400 text-sm">
                Select your jump date. Dropzone operates Tuesday through Sunday. Closed Mondays.
              </p>
              <div className="bg-neutral-900 p-4 rounded-2xl border border-white/10 flex justify-center shadow-xl">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-heading font-bold flex items-center gap-2">
                <Clock className="text-primary w-8 h-8" /> Available Times
              </h3>
              <p className="text-zinc-400 text-sm">
                {date ? `Showing availability for ${format(date, "MMMM d, yyyy")}` : "Select a date to view slots."}
              </p>
              <Card className="bg-neutral-900 border-white/10 text-white shadow-xl max-h-[300px] overflow-y-auto">
                <CardContent className="space-y-3 pt-6">
                  {loadingSlots && <div className="text-center py-6 text-zinc-500">Loading slots...</div>}
                  {!loadingSlots && slots.length === 0 && (
                    <div className="text-center py-6 text-zinc-500">No time slots available for this date.</div>
                  )}
                  {!loadingSlots &&
                    slots.map(slot => {
                      const isFull = (slot.remaining ?? 0) <= 0;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => !isFull && setSelectedTime(slot.time)}
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all hover:bg-white/5",
                            selectedTime === slot.time
                              ? "border-primary bg-primary/10 text-white shadow-lg"
                              : "border-white/10 text-zinc-300",
                            isFull && "opacity-30 cursor-not-allowed hover:bg-transparent"
                          )}
                        >
                          <span className="font-semibold">{slot.time}</span>
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold", isFull ? "bg-zinc-800 text-zinc-500" : "bg-primary/20 text-primary")}>
                            {isFull ? "Full" : `${slot.remaining} Slots Left`}
                          </span>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>

              <div className="pt-4 text-right">
                <Button onClick={nextStep} disabled={!selectedTime} className="bg-primary hover:bg-primary/90 text-white px-8 py-5 text-base">
                  Choose Experience <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE PACKAGES */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-3xl font-heading font-bold">Choose Your Experience</h3>
              <p className="text-zinc-400 text-sm">Select the package that fits your adrenaline levels. Pricing includes all safety gears and training.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(packages).map(([key, pkg]) => (
                <div
                  key={key}
                  onClick={() => setSelectedPackage(key)}
                  className={cn(
                    "p-6 border rounded-2xl cursor-pointer flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xl",
                    selectedPackage === key
                      ? "border-primary bg-primary/5 text-white shadow-primary/10"
                      : "border-white/10 bg-neutral-900/50 hover:bg-neutral-900"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xl text-white">{pkg.name}</h4>
                      <span className="text-2xl font-bold text-primary">${pkg.price}</span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{pkg.desc}</p>
                  </div>
                  <div className="mt-8">
                    <span className={cn("w-full py-2.5 rounded-lg text-xs font-bold flex justify-center uppercase tracking-wider border", selectedPackage === key ? "bg-primary border-primary text-white" : "border-white/10 text-zinc-400")}>
                      {selectedPackage === key ? "Selected" : "Select Package"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep} className="border-white/10 text-white">
                Back
              </Button>
              <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white px-8">
                Select Instructor <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: INSTRUCTOR SELECTION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-3xl font-heading font-bold">Select Your Instructor</h3>
              <p className="text-zinc-400 text-sm">Choose an elite pilot to jump with, or opt for any available instructor for maximum flexibility.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructors.map(i => (
                <div
                  key={i.id}
                  onClick={() => setSelectedInstructor(i.id)}
                  className={cn(
                    "p-6 border rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-xl",
                    selectedInstructor === i.id
                      ? "border-primary bg-primary/5 text-white"
                      : "border-white/10 bg-neutral-900/50 hover:bg-neutral-900"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xl text-zinc-400 border border-white/5 mb-4 uppercase">
                    {i.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">{i.name}</h4>
                  <p className="text-xs text-zinc-500 mb-6">
                    {i.id === "any" ? "Best availability & faster booking" : "USPA Certified Tandem Master"}
                  </p>
                  <span className={cn("w-full py-2 rounded-lg text-xs font-bold flex justify-center uppercase tracking-wider border", selectedInstructor === i.id ? "bg-primary border-primary text-white" : "border-white/10 text-zinc-400")}>
                    {selectedInstructor === i.id ? "Selected" : "Select"}
                  </span>
                </div>
              ))}
            </div>

            {/* Extras Selection Embedded in Instructor Step for flow continuity */}
            <div className="mt-12 bg-neutral-900 p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="font-bold text-xl text-white">Upgrade Your Experience</h4>
              <p className="text-zinc-400 text-xs">Capture your jump forever with handcam footage, or add premium insurance coverage.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {extras.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => toggleExtra(ex.id)}
                    className={cn(
                      "p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-colors",
                      selectedExtras.includes(ex.id)
                        ? "border-primary bg-primary/10 text-white"
                        : "border-white/5 bg-zinc-950 hover:bg-white/5"
                    )}
                  >
                    <div>
                      <span className="font-bold text-sm block">{ex.name}</span>
                      <span className="text-zinc-400 text-xs">+${ex.price}</span>
                    </div>
                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center text-xs font-bold", selectedExtras.includes(ex.id) ? "bg-primary border-primary text-white" : "border-white/20")}>
                      {selectedExtras.includes(ex.id) && "✓"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep} className="border-white/10 text-white">
                Back
              </Button>
              <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white px-8">
                Compliance Checklist <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: COMPLIANCE CHECKLIST */}
        {step === 4 && (
          <div className="max-w-xl mx-auto bg-neutral-900 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl">
            <ComplianceChecklist
              onComplete={() => {
                setComplianceCleared(true);
                nextStep();
              }}
            />
          </div>
        )}

        {/* STEP 5: REVIEW & CHECKOUT */}
        {step === 5 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-heading font-bold">Review Your Order</h3>
              <p className="text-zinc-400 text-sm">Please verify your booking details before securing your slot.</p>
            </div>

            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-zinc-400">Date & Time</span>
                <span className="font-semibold text-white">
                  {date ? format(date, "MMMM d, yyyy") : ""} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-zinc-400">Jump Package</span>
                <span className="font-semibold text-white uppercase text-xs tracking-wider">
                  {packages[selectedPackage as keyof typeof packages].name}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-zinc-400">Instructor Assigned</span>
                <span className="font-semibold text-white">
                  {selectedInstructor === "any" ? "Any Available" : instructors.find(i => i.id === selectedInstructor)?.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-zinc-400">Add-ons (Extras)</span>
                <span className="font-semibold text-white">
                  {selectedExtras.length === 0
                    ? "None"
                    : selectedExtras.map(exId => extras.find(e => e.id === exId)?.name).join(", ")}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-xl font-bold border-t border-white/10">
                <span>Total Amount</span>
                <span className="text-primary">${totalPrice}</span>
              </div>
            </div>

            {!user && (
              <div className="space-y-3 bg-zinc-950 p-6 rounded-2xl border border-primary/20 shadow-inner">
                <div className="flex items-center gap-2 text-primary">
                  <UserIcon className="w-5 h-5" />
                  <h4 className="font-bold text-white text-base">Secure Your Booking</h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Provide your email address to lock in this slot. This will instantly create your Student profile where you can view your schedule, sign waivers, and track jump video uploads.
                </p>
                <input
                  type="email"
                  placeholder="enter.your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full mt-2 bg-neutral-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep} className="border-white/10 text-white">
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={submitting || (!user && !guestEmail)}
                className="flex-grow bg-primary hover:bg-primary/95 text-white text-base py-5"
              >
                {submitting ? "CONFIRMING..." : "CONFIRM & LOCK SLOT"}
              </Button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}