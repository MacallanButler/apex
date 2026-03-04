"use client"

import { useState } from "react"
import { CheckCircle2, Circle, AlertCircle, Lock, Unlock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Prerequisite {
    id: string
    label: string
    info: string
    required: boolean
}

const prerequisites: Prerequisite[] = [
    { id: "age", label: "I am 18 years of age or older", info: "USPA regulation. Valid photo ID required on jump day.", required: true },
    { id: "weight", label: "I weigh 220 lbs or less", info: "Equipment rated limit. Instructor approval required above 220 lbs.", required: true },
    { id: "health", label: "I have no significant heart or blood pressure conditions", info: "Consult your physician if in doubt. High-altitude activities increase cardiac load.", required: true },
    { id: "alcohol", label: "I have not consumed alcohol in the past 12 hours", info: "USPA safety regulation. Zero tolerance on jump day.", required: true },
    { id: "waiver", label: "I understand this is an extreme sport with inherent risk", info: "You'll sign a physical waiver on arrival. This is a digital pre-acknowledgement.", required: true },
]

interface ComplianceChecklistProps {
    onComplete: () => void
}

export function ComplianceChecklist({ onComplete }: ComplianceChecklistProps) {
    const [checked, setChecked] = useState<Record<string, boolean>>({})
    const [expanded, setExpanded] = useState<string | null>(null)

    const allChecked = prerequisites.every(p => !p.required || checked[p.id])

    const toggle = (id: string) => {
        setChecked(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-white font-bold text-lg">USPA Compliance Check</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Before booking, please confirm all prerequisites. This ensures your safety and our regulatory compliance.
                    </p>
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
                {prerequisites.map(p => (
                    <div key={p.id} className="rounded-lg border border-white/5 overflow-hidden">
                        <button
                            className="w-full flex items-start gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                            onClick={() => toggle(p.id)}
                        >
                            {checked[p.id]
                                ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                : <Circle className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
                            }
                            <div className="flex-1">
                                <span className={cn("text-sm font-medium transition-colors", checked[p.id] ? "text-green-300 line-through decoration-green-600/50" : "text-white")}>
                                    {p.label}
                                </span>
                                {/* Info toggle */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setExpanded(prev => prev === p.id ? null : p.id) }}
                                    className="block text-[11px] text-primary hover:underline mt-0.5"
                                >
                                    {expanded === p.id ? "Hide details" : "Why is this required?"}
                                </button>
                                {expanded === p.id && (
                                    <p className="text-xs text-muted-foreground mt-1.5 pr-2">{p.info}</p>
                                )}
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            {/* Progress indicator */}
            <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Compliance Status</span>
                    <span>{Object.values(checked).filter(Boolean).length} / {prerequisites.length} confirmed</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 rounded-full"
                        style={{ width: `${(Object.values(checked).filter(Boolean).length / prerequisites.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* CTA */}
            <Button
                className="w-full gap-2"
                disabled={!allChecked}
                onClick={onComplete}
            >
                {allChecked
                    ? <><Unlock className="w-4 h-4" /> Proceed to Booking</>
                    : <><Lock className="w-4 h-4" /> Complete All Items to Continue</>
                }
            </Button>
        </div>
    )
}
