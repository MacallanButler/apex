import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3 bg-neutral-900 rounded-xl", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-semibold text-white",
                nav: "space-x-1 flex items-center",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-white/10 hover:bg-white/5 absolute left-1"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-white/10 hover:bg-white/5 absolute right-1"
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex justify-between w-full",
                weekday:
                    "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center h-9",
                week: "flex w-full mt-2 justify-between",
                day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center focus-within:relative focus-within:z-20",
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                ),
                selected:
                    "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-lg",
                today: "bg-zinc-800 text-white rounded-lg border border-white/10",
                outside:
                    "outside text-zinc-600 opacity-40 aria-selected:bg-zinc-800/50 aria-selected:text-zinc-400",
                disabled: "text-zinc-700 opacity-20 cursor-not-allowed",
                range_middle:
                    "aria-selected:bg-zinc-800 aria-selected:text-white",
                hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
