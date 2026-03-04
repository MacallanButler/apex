/**
 * Slot-based scheduling algorithm for Apex Altitude.
 *
 * Rules:
 * - Weekdays: max 8 slots
 * - Weekends: max 20 slots
 * - Random seed based on date string (deterministic per day, not truly random)
 * - Slots taken by: group size, weather margin, and instructor availability
 * - Returns an availability object: Open | Limited | Full | Closed (Mondays)
 */

export type AvailabilityStatus = "Open" | "Limited" | "Full" | "Closed" | "Weather Hold"

export interface SlotAvailability {
    status: AvailabilityStatus
    slotsRemaining: number
    maxSlots: number
    nextOpenDate?: string
}

/** Simple deterministic hash from a string (no external deps) */
function hashDate(dateStr: string): number {
    let hash = 0
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

export function getSlotAvailability(date: Date, weatherStatus: "GO" | "MARGINAL" | "NO-GO"): SlotAvailability {
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday

    // Dropzone closed Mondays for maintenance
    if (dayOfWeek === 1) {
        return { status: "Closed", slotsRemaining: 0, maxSlots: 0 }
    }

    // Weather hold if conditions are no-go
    if (weatherStatus === "NO-GO") {
        return { status: "Weather Hold", slotsRemaining: 0, maxSlots: 0 }
    }

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const maxSlots = isWeekend ? 20 : 8

    // Seed slot consumption from the date so it's deterministic
    const dateStr = date.toISOString().split("T")[0]
    const seed = hashDate(dateStr)
    const consumed = seed % (maxSlots + 1) // 0..maxSlots consumed

    // Marginal weather reduces available slots by 30%
    const weatherPenalty = weatherStatus === "MARGINAL" ? Math.floor(maxSlots * 0.3) : 0
    const remaining = Math.max(0, maxSlots - consumed - weatherPenalty)

    let status: AvailabilityStatus
    if (remaining === 0) status = "Full"
    else if (remaining <= maxSlots * 0.3) status = "Limited"
    else status = "Open"

    return { status, slotsRemaining: remaining, maxSlots }
}

export function getStatusColor(status: AvailabilityStatus): string {
    switch (status) {
        case "Open": return "text-green-400"
        case "Limited": return "text-yellow-400"
        case "Full": return "text-red-400"
        case "Closed":
        case "Weather Hold": return "text-zinc-500"
    }
}
