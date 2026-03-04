"use client"

import { useRoleStore, roleColors, type UserRole } from "@/lib/rbac"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const roles: UserRole[] = ["Guest", "Student", "Instructor", "Admin"]

const roleDescriptions: Record<UserRole, string> = {
    Guest: "Browse only — no booking access",
    Student: "Book Tandem & Solo jumps",
    Instructor: "All bookings + manifest view",
    Admin: "Full access — all features unlocked",
}

export function RoleSwitcher() {
    const { role, setRole } = useRoleStore()
    const [open, setOpen] = useState(false)

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    roleColors[role]
                )}
            >
                <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                {role}
                <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-3 pt-2 pb-1 border-b border-white/5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Switch Role (Demo)
                    </div>
                    {roles.map(r => (
                        <button
                            key={r}
                            onClick={() => { setRole(r); setOpen(false) }}
                            className={cn(
                                "w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors",
                                r === role && "bg-white/5"
                            )}
                        >
                            <span className={cn("font-semibold text-xs px-1.5 py-0.5 rounded mr-2", roleColors[r])}>
                                {r}
                            </span>
                            <span className="text-zinc-500 text-xs">{roleDescriptions[r]}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
