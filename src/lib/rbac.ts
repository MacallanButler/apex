"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = "Guest" | "Student" | "Instructor" | "Admin"

interface RoleStore {
    role: UserRole
    setRole: (role: UserRole) => void
}

/**
 * Client-side RBAC simulation via Zustand + localStorage persistence.
 * No backend authentication — role is set via the RoleSwitcher UI component.
 */
export const useRoleStore = create<RoleStore>()(
    persist(
        (set) => ({
            role: "Guest",
            setRole: (role) => set({ role }),
        }),
        { name: "apex-user-role" }
    )
)

/** Returns true if the current role can access a given minimum role level */
const roleHierarchy: Record<UserRole, number> = {
    Guest: 0,
    Student: 1,
    Instructor: 2,
    Admin: 3,
}

export function hasAccess(userRole: UserRole, requiredRole: UserRole): boolean {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export const roleColors: Record<UserRole, string> = {
    Guest: "bg-zinc-700 text-zinc-300",
    Student: "bg-blue-900/60 text-blue-300 border border-blue-500/30",
    Instructor: "bg-amber-900/60 text-amber-300 border border-amber-500/30",
    Admin: "bg-rose-900/60 text-rose-300 border border-rose-500/30",
}
