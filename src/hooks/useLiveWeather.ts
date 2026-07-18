import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

interface WeatherReading {
  windKts: number;
  ceilingFt: number;
  tempF: number;
  visibility: string;
  status: "GO" | "MARGINAL" | "NO-GO";
  statusColor: "green" | "yellow" | "red";
}

function getStatusColor(status: string) {
  const norm = status.toLowerCase();
  if (norm === "no_go" || norm === "no-go") return "red";
  if (norm === "marginal") return "yellow";
  return "green";
}

function getDisplayStatus(status: string) {
  const norm = status.toLowerCase();
  if (norm === "no_go" || norm === "no-go") return "NO-GO";
  if (norm === "marginal") return "MARGINAL";
  return "GO";
}

export function useLiveWeather(): WeatherReading {
  const [weather, setWeather] = useState<WeatherReading>({
    windKts: 10,
    ceilingFt: 10000,
    tempF: 72,
    visibility: "10sm",
    status: "GO",
    statusColor: "green"
  });

  const fetchWeather = async () => {
    try {
      const data = await apiClient.getCurrentWeather();
      if (data) {
        setWeather({
          windKts: Number(data.wind_kts),
          ceilingFt: data.ceiling_ft,
          tempF: data.temp_f,
          visibility: data.visibility,
          status: getDisplayStatus(data.status),
          statusColor: getStatusColor(data.status)
        });
      }
    } catch (e) {
      console.error("Error fetching weather:", e);
    }
  };

  useEffect(() => {
    fetchWeather();

    // Fallback polling
    const interval = setInterval(fetchWeather, 60000);

    // WebSocket sync
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
        if (msg.type === "weather_update") {
          const w = msg.weather;
          setWeather({
            windKts: Number(w.wind_kts),
            ceilingFt: w.ceiling_ft,
            tempF: w.temp_f,
            visibility: w.visibility,
            status: getDisplayStatus(w.status),
            statusColor: getStatusColor(w.status)
          });
        }
      } catch (e) {
        console.error("Action Cable weather update error:", e);
      }
    };

    return () => {
      clearInterval(interval);
      socket.close();
    };
  }, []);

  return weather;
}
