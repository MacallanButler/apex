// /lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Determine if we should use the real Supabase client
const isRealSupabase =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "" &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_");

export let supabase: any;

if (isRealSupabase) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} else {
  // Client-side LocalStorage-based Mock Supabase Client for demo / offline development
  class MockSupabaseClient {
    private listeners: Array<(event: string, session: any) => void> = [];

    constructor() {
      if (typeof window !== "undefined") {
        // Seed default time slots if not present
        if (!localStorage.getItem("apex_time_slots")) {
          const slots: any[] = [];
          const times = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"];
          const today = new Date();
          
          for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            
            // Skip Mondays (Dropzone closed Mondays)
            if (d.getDay() === 1) continue;
            
            times.forEach((time, index) => {
              slots.push({
                id: `slot-${dateStr}-${index}`,
                date: dateStr,
                time: time,
                capacity: d.getDay() === 0 || d.getDay() === 6 ? 20 : 8,
                location: "Main Dropzone"
              });
            });
          }
          localStorage.setItem("apex_time_slots", JSON.stringify(slots));
        }

        // Seed default profiles
        if (!localStorage.getItem("apex_profiles")) {
          localStorage.setItem("apex_profiles", JSON.stringify([
            { id: "admin-id", email: "admin@apex.com", role: "admin", name: "System Admin" },
            { id: "instructor-id", email: "instructor@apex.com", role: "instructor", name: "Sarah Connor" },
            { id: "student-id", email: "student@apex.com", role: "student", name: "Jane Doe" }
          ]));
        }

        // Seed default bookings
        if (!localStorage.getItem("apex_bookings")) {
          const defaultBookings = [
            {
              id: "booking-1",
              user_id: "student-id",
              student_email: "student@apex.com",
              date: new Date().toISOString().split("T")[0],
              time: "09:00 AM",
              package: "tandem",
              instructor: "sarah",
              extras: ["video", "photos"],
              total: 427,
              status: "Scheduled"
            },
            {
              id: "booking-2",
              user_id: "guest-id-1",
              student_email: "alex.rider@example.com",
              date: new Date().toISOString().split("T")[0],
              time: "11:30 AM",
              package: "solo",
              instructor: "mike",
              extras: ["insurance"],
              total: 218,
              status: "Completed"
            },
            {
              id: "booking-3",
              user_id: "guest-id-2",
              student_email: "charlie.brown@example.com",
              date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
              time: "02:00 PM",
              package: "sunset",
              instructor: "any",
              extras: ["video", "insurance"],
              total: 427,
              status: "Scheduled"
            }
          ];
          localStorage.setItem("apex_bookings", JSON.stringify(defaultBookings));
        }
      }
    }

    auth = {
      getUser: async () => {
        if (typeof window === "undefined") return { data: { user: null }, error: null };
        const sessionStr = localStorage.getItem("apex_session");
        if (!sessionStr) return { data: { user: null }, error: null };
        const session = JSON.parse(sessionStr);
        return { data: { user: session.user }, error: null };
      },

      signInWithOtp: async ({ email }: { email: string }) => {
        if (typeof window === "undefined") return { error: null };
        let role = "student";
        let name = email.split("@")[0];
        let id = `student-id-${Date.now()}`;

        if (email === "admin@apex.com") {
          role = "admin";
          name = "System Admin";
          id = "admin-id";
        } else if (email === "instructor@apex.com") {
          role = "instructor";
          name = "Sarah Connor";
          id = "instructor-id";
        }

        const user = { id, email };

        // Save session
        const session = { user };
        localStorage.setItem("apex_session", JSON.stringify(session));

        // Create profile if not exists
        const profiles = JSON.parse(localStorage.getItem("apex_profiles") || "[]");
        if (!profiles.some((p: any) => p.email === email)) {
          profiles.push({ id, email, role, name });
          localStorage.setItem("apex_profiles", JSON.stringify(profiles));
        }

        // Notify listeners
        this.listeners.forEach(cb => cb("SIGNED_IN", session));
        return { error: null };
      },

      signOut: async () => {
        if (typeof window === "undefined") return { error: null };
        localStorage.removeItem("apex_session");
        this.listeners.forEach(cb => cb("SIGNED_OUT", null));
        return { error: null };
      },

      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        this.listeners.push(callback);
        if (typeof window !== "undefined") {
          const sessionStr = localStorage.getItem("apex_session");
          if (sessionStr) {
            callback("SIGNED_IN", JSON.parse(sessionStr));
          } else {
            callback("SIGNED_OUT", null);
          }
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this.listeners = this.listeners.filter(cb => cb !== callback);
              }
            }
          }
        };
      }
    };

    from = (table: string) => {
      const getStore = () => {
        if (typeof window === "undefined") return [];
        const key = `apex_${table}`;
        return JSON.parse(localStorage.getItem(key) || "[]");
      };

      const saveStore = (data: any) => {
        if (typeof window === "undefined") return;
        const key = `apex_${table}`;
        localStorage.setItem(key, JSON.stringify(data));
      };

      let currentData = getStore();

      const queryBuilder = {
        select: (fields?: string) => {
          return queryBuilder;
        },
        eq: (field: string, value: any) => {
          currentData = currentData.filter((item: any) => item[field] === value);
          return queryBuilder;
        },
        single: async () => {
          return { data: currentData[0] || null, error: currentData.length === 0 ? new Error("Not found") : null };
        },
        insert: async (newData: any) => {
          const items = Array.isArray(newData) ? newData : [newData];
          const store = getStore();
          const addedItems = items.map(item => ({
            id: item.id || `mock-id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            ...item
          }));
          saveStore([...store, ...addedItems]);
          return { data: addedItems, error: null };
        },
        update: async (updateData: any) => {
          // Simplistic mock update
          const store = getStore();
          const updatedStore = store.map((item: any) => {
            // If the item matches all filters in currentData, update it
            const matches = currentData.some((c: any) => c.id === item.id);
            if (matches) {
              return { ...item, ...updateData };
            }
            return item;
          });
          saveStore(updatedStore);
          return { data: updateData, error: null };
        },
        // Support direct promise awaits (e.g. await supabase.from('...').select('*'))
        then: (onfulfilled?: (value: any) => any) => {
          const promise = Promise.resolve({ data: currentData, error: null });
          return onfulfilled ? promise.then(onfulfilled) : promise;
        }
      };

      return queryBuilder;
    };
  }

  supabase = new MockSupabaseClient();
}