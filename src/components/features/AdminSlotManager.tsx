"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
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
    try {
      const data = await apiClient.getSlots();
      setSlots((data as Slot[]) || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  useEffect(() => {
    if (profile?.role === "admin") fetchSlots();
  }, [profile]);

  const handleCreate = async () => {
    if (!date || !time) return;
    try {
      await apiClient.createSlot({ date, time, capacity, location: location || undefined });
      setDate("");
      setTime("");
      setCapacity(10);
      setLocation("");
      fetchSlots();
    } catch (err) {
      alert("Error creating slot.");
    }
  };

  if (profile?.role !== "admin") return null;

  return (
    <section className="p-10 bg-neutral-800 text-white rounded-2xl border border-white/10 mt-6 shadow-xl">
      <h2 className="text-2xl mb-4 font-heading font-bold text-primary">Manage Slots</h2>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="bg-neutral-900 border-white/10 text-white" />
        <Input type="text" placeholder="Time (e.g. 09:00 AM)" value={time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)} className="bg-neutral-900 border-white/10 text-white" />
        <Input
          type="number"
          value={capacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(Number(e.target.value))}
          className="bg-neutral-900 border-white/10 text-white"
        />
        <Input
          type="text"
          value={location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          placeholder="Location"
          className="bg-neutral-900 border-white/10 text-white"
        />
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-white font-bold font-heading uppercase px-6">Create Slot</Button>
      </div>

      <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {slots.map(slot => (
          <li key={slot.id} className="p-3 bg-neutral-900 rounded-lg border border-white/5 flex justify-between items-center text-sm">
            <span>{slot.date} at <strong className="text-white">{slot.time}</strong> - Max Jumper Capacity: <strong className="text-primary">{slot.capacity}</strong> - {slot.location || "Main Dropzone"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}