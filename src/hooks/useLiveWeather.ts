import { useState, useEffect, useCallback } from "react"

interface WeatherReading {
    windKts: number
    ceilingFt: number
    tempF: number
    visibility: "Clear" | "Partly Cloudy" | "Overcast"
    status: "GO" | "MARGINAL" | "NO-GO"
    statusColor: "green" | "yellow" | "red"
}

// Weighted set of realistic weather states that cycle with added noise
const baseStates: Omit<WeatherReading, "status" | "statusColor">[] = [
    { windKts: 5, ceilingFt: 12000, tempF: 74, visibility: "Clear" },
    { windKts: 8, ceilingFt: 10500, tempF: 71, visibility: "Clear" },
    { windKts: 12, ceilingFt: 8000, tempF: 68, visibility: "Partly Cloudy" },
    { windKts: 18, ceilingFt: 6500, tempF: 65, visibility: "Partly Cloudy" },
    { windKts: 22, ceilingFt: 4500, tempF: 62, visibility: "Overcast" },
    { windKts: 28, ceilingFt: 3000, tempF: 60, visibility: "Overcast" },
]

function classifyStatus(reading: Omit<WeatherReading, "status" | "statusColor">): Pick<WeatherReading, "status" | "statusColor"> {
    const noGo = reading.windKts > 25 || reading.ceilingFt < 4000
    const marginal = reading.windKts > 15 || reading.ceilingFt < 7000

    if (noGo) return { status: "NO-GO", statusColor: "red" }
    if (marginal) return { status: "MARGINAL", statusColor: "yellow" }
    return { status: "GO", statusColor: "green" }
}

function addNoise(base: typeof baseStates[0]): Omit<WeatherReading, "status" | "statusColor"> {
    return {
        windKts: Math.max(0, base.windKts + Math.round((Math.random() - 0.5) * 4)),
        ceilingFt: Math.max(1000, base.ceilingFt + Math.round((Math.random() - 0.5) * 500)),
        tempF: Math.round(base.tempF + (Math.random() - 0.5) * 3),
        visibility: base.visibility,
    }
}

export function useLiveWeather(intervalMs = 4000): WeatherReading {
    const [stateIndex, setStateIndex] = useState(0)
    const [reading, setReading] = useState<WeatherReading>(() => {
        const base = addNoise(baseStates[0])
        return { ...base, ...classifyStatus(base) }
    })

    const tick = useCallback(() => {
        setStateIndex(prev => {
            const nextIndex = (prev + 1) % baseStates.length
            const base = addNoise(baseStates[nextIndex])
            setReading({ ...base, ...classifyStatus(base) })
            return nextIndex
        })
    }, [stateIndex])

    useEffect(() => {
        const timer = setInterval(tick, intervalMs)
        return () => clearInterval(timer)
    }, [tick, intervalMs])

    return reading
}
