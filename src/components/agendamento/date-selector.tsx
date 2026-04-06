"use client"

import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DateSelectorProps {
  dates: Date[]
  selected: Date | null
  onSelect: (date: Date) => void
}

export function DateSelector({ dates, selected, onSelect }: DateSelectorProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {dates.map((date) => {
        const isSelected = selected && isSameDay(date, selected)
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect(date)}
            className={cn(
              "flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-card-foreground hover:bg-muted"
            )}
          >
            <span className="text-[10px] font-medium uppercase">
              {format(date, "EEE", { locale: ptBR })}
            </span>
            <span className="text-lg font-bold">{format(date, "dd")}</span>
            <span className="text-[10px]">
              {format(date, "MMM", { locale: ptBR })}
            </span>
          </button>
        )
      })}
    </div>
  )
}
