"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/UserContext";

interface Slot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  location?: string;
}

export function AdminSlotManager() {
  const { profile } = useUser();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [location, setLocation] = useState("");

  const fetchSlots = async () => {
    const { data } = await supabase.from("time_slots").select("*");
    setSlots((data as Slot[]) || []);
  };

  useEffect(() => {
    if (profile?.role === "admin") fetchSlots();
  }, [profile]);

  const handleCreate = async () => {
    if (!date || !time) return;
    await supabase.from("time_slots").insert({ date, time, capacity, location });
    setDate("");
    setTime("");
    setCapacity(10);
    setLocation("");
    fetchSlots();
  };

  if (profile?.role !== "admin") return null;

  return (
    <section className="p-10 bg-neutral-800 text-white">
      <h2 className="text-2xl mb-4">Manage Slots</h2>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
        <Input type="time" value={time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)} />
        <Input
          type="number"
          value={capacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(Number(e.target.value))}
        />
        <Input
          type="text"
          value={location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          placeholder="Location"
        />
        <Button onClick={handleCreate}>Create Slot</Button>
      </div>

      <ul className="space-y-2">
        {slots.map(slot => (
          <li key={slot.id}>
            {slot.date} {slot.time} - Max: {slot.capacity} - {slot.location || "No location"}
          </li>
        ))}
      </ul>
    </section>
  );
}