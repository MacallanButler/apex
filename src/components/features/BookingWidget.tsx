"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, CalendarIcon, UserIcon, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComplianceChecklist } from "@/components/features/ComplianceChecklist";
import { useUser } from "@/lib/UserContext";

// Stripe libraries
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder_key_at_least_10_chars");

interface Slot {
  id: string;
  time: string;
  capacity: number;
  remaining?: number;
}

interface PaymentInfo {
  bookingId: string;
  clientSecret: string;
  depositAmount: number;
  remainingAmount: number;
}

// ----------------------------------------------------
// Stripe Card Checkout Form Sub-component
// ----------------------------------------------------
interface CheckoutFormProps {
  bookingId: string;
  clientSecret: string;
  depositAmount: number;
  remainingAmount: number;
  onSuccess: () => void;
}

function CheckoutForm({ bookingId, clientSecret, depositAmount, remainingAmount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // Mock payment flow if in mock mode
    if (clientSecret.startsWith("mock_secret_")) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      try {
        const bookingRes = await fetch(`http://localhost:3000/api/v1/bookings/${bookingId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("apex_jwt") || "",
          },
        });
        const bookingData = await bookingRes.json();
        const piId = bookingData.stripe_payment_intent_id;

        const webhookRes = await fetch("http://localhost:3000/api/v1/webhooks/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "payment_intent.succeeded",
            data: {
              object: {
                id: piId,
              },
            },
          }),
        });

        if (!webhookRes.ok) {
          throw new Error("Failed to confirm mock payment.");
        }
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Mock payment confirmation failed.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Real Stripe payment flow
    if (!stripe || !elements) {
      setError("Stripe elements has not loaded yet.");
      setProcessing(false);
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card input not found.");
      setProcessing(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    if (result.error) {
      setError(result.error.message || "An error occurred during payment.");
      setProcessing(false);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        onSuccess();
      } else {
        setError("Payment is pending confirmation.");
        setProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl">
        <h4 className="font-heading font-bold text-lg text-white">Deposit Payment</h4>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Deposit Due Now (30%)</span>
          <span className="text-primary font-bold">${depositAmount}</span>
        </div>
        <div className="flex justify-between text-sm border-b border-white/5 pb-3">
          <span className="text-zinc-400">Remaining Balance (due at check-in)</span>
          <span className="text-white font-semibold">${remainingAmount}</span>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider">Credit or Debit Card</label>
          <div className="p-3 bg-neutral-950 border border-white/10 rounded-lg">
            {clientSecret.startsWith("mock_secret_") ? (
              <div className="text-xs text-amber-500/90 space-y-1">
                <p>Mock Payment Mode active. Enter any mock details.</p>
                <input
                  type="text"
                  placeholder="Card Number"
                  defaultValue="4242 4242 4242 4242"
                  disabled
                  className="w-full bg-transparent border-0 outline-none text-zinc-300 text-sm mt-1 cursor-not-allowed"
                />
              </div>
            ) : (
              <CardElement
                options={{
                  style: {
                    base: {
                      color: "#ffffff",
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "16px",
                      "::placeholder": {
                        color: "#71717a",
                      },
                    },
                    invalid: {
                      color: "#ef4444",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-500 font-semibold">{error}</div>}

      <Button
        type="submit"
        disabled={processing || (!clientSecret.startsWith("mock_secret_") && !stripe)}
        className="w-full bg-primary hover:bg-primary/95 text-white py-5 text-base font-bold font-heading uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
      >
        {processing ? "PROCESSING PAYMENT..." : `PAY DEPOSIT $${depositAmount}`}
      </Button>
    </form>
  );
}

// ----------------------------------------------------
// Main Booking Widget Component
// ----------------------------------------------------
export function BookingWidget() {
  const { user, refresh: refreshUser } = useUser();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("tandem");
  const [selectedInstructor, setSelectedInstructor] = useState("any");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [complianceChecked, setComplianceChecked] = useState<Record<string, boolean>>({});
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Payment states
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  // Guest Account Upgrade States
  const [upgradePassword, setUpgradePassword] = useState("");
  const [upgradeName, setUpgradeName] = useState("");
  const [upgradePhone, setUpgradePhone] = useState("");
  const [upgraded, setUpgraded] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");

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
    { id: "instructor-id", name: "Sarah Connor" }, // Matches instructor user seeded
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

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Fetch slots and subscribe to real-time changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!date) return;
      setLoadingSlots(true);
      const formatted = format(date, "yyyy-MM-dd");

      try {
        const slotsData = await apiClient.getSlots(formatted, formatted);
        setSlots(slotsData || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [date]);

  // Action Cable WebSockets Connection for live slot capacity & weather changes
  useEffect(() => {
    const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/^http/, "ws") + "/cable";
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({ channel: "SlotsChannel" })
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ping" || !data.message) return;

        const msg = data.message;
        if (msg.type === "slot_update") {
          const updatedSlot = msg.slot;
          setSlots(prev => prev.map(slot =>
            slot.id === updatedSlot.id ? { ...slot, remaining: updatedSlot.remaining } : slot
          ));
        } else if (msg.type === "weather_update") {
          if (date) {
            const formatted = format(date, "yyyy-MM-dd");
            apiClient.getSlots(formatted, formatted).then(setSlots);
          }
        }
      } catch (e) {
        console.error("Action Cable message parsing error:", e);
      }
    };

    return () => {
      socket.close();
    };
  }, [date]);

  const handleBookingSubmit = async () => {
    if (!date || !selectedTime) return;
    setSubmitting(true);

    try {
      const slot = slots.find(s => s.time === selectedTime);
      if (!slot) throw new Error("Selected time slot is invalid.");

      const bookingPayload = {
        time_slot_id: slot.id,
        package: selectedPackage,
        instructor_id: selectedInstructor === "any" ? undefined : selectedInstructor,
        total_cents: totalPrice * 100,
        guest_name: user ? undefined : guestName,
        guest_email: user ? undefined : guestEmail,
        guest_phone: user ? undefined : guestPhone,
        extras: selectedExtras,
        waiver_acknowledgment_attributes: {
          age_confirmed: complianceChecked.age || false,
          weight_confirmed: complianceChecked.weight || false,
          health_confirmed: complianceChecked.health || false,
          alcohol_confirmed: complianceChecked.alcohol || false,
          risk_acknowledged: complianceChecked.waiver || false,
          ip_address: "127.0.0.1",
        }
      };

      const booking = await apiClient.createBooking(bookingPayload);
      const secretRes = await apiClient.getPaymentIntent(booking.id);

      setPaymentInfo({
        bookingId: booking.id,
        clientSecret: secretRes.client_secret,
        depositAmount: Math.round(totalPrice * 0.3),
        remainingAmount: totalPrice - Math.round(totalPrice * 0.3),
      });

      nextStep(); // Advance to payment sub-step
    } catch (err: any) {
      alert(err.message || "Failed to initiate booking creation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError("");

    try {
      await apiClient.guestUpgrade(
        guestEmail,
        upgradePassword,
        upgradeName || guestName || guestEmail.split("@")[0],
        upgradePhone || guestPhone
      );
      setUpgraded(true);
      await refreshUser();
    } catch (err: any) {
      setUpgradeError(err.message || "Failed to upgrade guest account.");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in">
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
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold transition-all duration-300", isFull ? "bg-zinc-800 text-zinc-500" : "bg-primary/20 text-primary")}>
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
          <div className="space-y-6 animate-fade-in">
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
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-3xl font-heading font-bold">Select Your Instructor</h3>
              <p className="text-zinc-400 text-sm">Choose an elite pilot to jump with, or opt for any available instructor for maximum flexibility.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
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

            {/* Extras Selection */}
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
          <div className="max-w-xl mx-auto bg-neutral-900 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in">
            <ComplianceChecklist
              onComplete={(checked) => {
                setComplianceChecked(checked);
                nextStep();
              }}
            />
          </div>
        )}

        {/* STEP 5: REVIEW & PAYMENT INTENT */}
        {step === 5 && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            {!paymentInfo ? (
              <>
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
                    <span className="font-semibold text-white text-right">
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
                  <div className="space-y-4 bg-zinc-950 p-6 rounded-2xl border border-primary/20 shadow-inner">
                    <div className="flex items-center gap-2 text-primary">
                      <UserIcon className="w-5 h-5" />
                      <h4 className="font-bold text-white text-base">Secure Your Booking</h4>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Provide details to secure this booking as a Guest. You can upgrade to a Student profile immediately after payment.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-neutral-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-neutral-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-neutral-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} className="border-white/10 text-white">
                    Back
                  </Button>
                  <Button
                    onClick={handleBookingSubmit}
                    disabled={submitting || (!user && (!guestEmail || !guestName))}
                    className="flex-grow bg-primary hover:bg-primary/95 text-white text-base py-5 font-bold uppercase tracking-wider"
                  >
                    {submitting ? "PROCESSING..." : "CONFIRM & LOCK SLOT"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-heading font-bold text-white">Checkout</h3>
                  <p className="text-zinc-400 text-sm">Lock in your slot with a 30% deposit payment.</p>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: paymentInfo.clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#ea580c",
                        colorBackground: "#171717",
                        colorText: "#ffffff",
                        colorDanger: "#ef4444",
                        fontFamily: "Rajdhani, sans-serif",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    bookingId={paymentInfo.bookingId}
                    clientSecret={paymentInfo.clientSecret}
                    depositAmount={paymentInfo.depositAmount}
                    remainingAmount={paymentInfo.remainingAmount}
                    onSuccess={() => setStep(6)}
                  />
                </Elements>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CONFIRMATION & GUEST ACCOUNT UPSELL */}
        {step === 6 && (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in text-center">
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h3 className="text-3xl font-heading font-bold text-white">Booking Confirmed!</h3>
              <p className="text-zinc-400 text-sm">
                Your deposit is paid and your jump slot is locked in. Welcome to Apex Altitude!
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl text-left space-y-4">
              <h4 className="font-bold text-white text-lg">Booking Info</h4>
              <p className="text-sm text-zinc-300">
                • <strong className="text-white">Date:</strong> {date ? format(date, "MMMM d, yyyy") : ""} at {selectedTime}
              </p>
              <p className="text-sm text-zinc-300">
                • <strong className="text-white">Experience:</strong> {packages[selectedPackage as keyof typeof packages].name}
              </p>
              <p className="text-sm text-zinc-300">
                • <strong className="text-white">Total price:</strong> ${totalPrice} (${paymentInfo?.depositAmount} paid deposit, ${paymentInfo?.remainingAmount} due on arrival)
              </p>
            </div>

            {/* Guest -> Account Upsell Prompt */}
            {!user && !upgraded && (
              <div className="bg-gradient-to-br from-neutral-900 to-zinc-950 p-6 rounded-2xl border border-primary/20 shadow-xl space-y-4 text-left">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">Save this booking + waiver for next time!</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Create a password below to upgrade your guest checkout to a Student account. This lets you access waiver receipts, check status, and download photos/videos later.
                  </p>
                </div>
                <form onSubmit={handleGuestUpgradeSubmit} className="space-y-3 pt-2">
                  <input
                    type="password"
                    placeholder="Create a Password"
                    value={upgradePassword}
                    onChange={(e) => setUpgradePassword(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={upgradeName}
                      onChange={(e) => setUpgradeName(e.target.value)}
                      className="bg-neutral-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={upgradePhone}
                      onChange={(e) => setUpgradePhone(e.target.value)}
                      className="bg-neutral-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white py-4 text-xs font-bold uppercase tracking-wider">
                    UPGRADE TO STUDENT ACCOUNT
                  </Button>
                  {upgradeError && <p className="text-xs text-red-500">{upgradeError}</p>}
                </form>
              </div>
            )}

            {upgraded && (
              <div className="p-4 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold">
                Account created successfully! You are now logged in.
              </div>
            )}

            <Button
              onClick={() => {
                window.location.reload();
              }}
              variant="outline"
              className="px-8 border-white/10 hover:bg-white/5"
            >
              Back to Home
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}