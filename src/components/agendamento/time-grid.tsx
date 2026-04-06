"use client"

import { cn } from "@/lib/utils"
import type { SlotHorario } from "@/types"

interface TimeGridProps {
  slots: SlotHorario[]
  selectedSlot: number | null
  onSelect: (agendaId: number) => void
}

export function TimeGrid({ slots, selectedSlot, onSelect }: TimeGridProps) {
  if (slots.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum horario disponivel nesta data.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => {
        const disponivel = slot.vagasDisponiveis > 0
        const selecionado = selectedSlot === slot.agendaId
        return (
          <button
            key={slot.agendaId}
            disabled={!disponivel}
            onClick={() => onSelect(slot.agendaId)}
            className={cn(
              "rounded-lg border py-2.5 text-sm font-medium transition-colors",
              selecionado
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : disponivel
                  ? "border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20"
                  : "border-border bg-muted text-muted-foreground opacity-50"
            )}
          >
            {slot.hora}
          </button>
        )
      })}
    </div>
  )
}
