"use client"

import { cn } from "@/lib/utils"
import type { Secretaria } from "@/types"

interface SecretariaFilterProps {
  secretarias: Secretaria[]
  selected: string | null
  onSelect: (id: string | null) => void
}

export function SecretariaFilter({
  secretarias,
  selected,
  onSelect,
}: SecretariaFilterProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          selected === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:bg-muted"
        )}
      >
        Todos
      </button>
      {secretarias.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            selected === s.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          {s.icone} {s.sigla}
        </button>
      ))}
    </div>
  )
}
