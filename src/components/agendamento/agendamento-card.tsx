"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, MapPin } from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS } from "@/constants"
import { cn } from "@/lib/utils"
import type { AgendamentoCompleto } from "@/types"

interface AgendamentoCardProps {
  agendamento: AgendamentoCompleto
  onCancel?: () => void
}

export function AgendamentoCard({ agendamento, onCancel }: AgendamentoCardProps) {
  const canCancel = agendamento.status === "AGENDADO"
  const dataFormatada = format(
    new Date(agendamento.dataAgendamento),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )
  const horaFormatada = format(
    new Date(agendamento.horaAgendamento),
    "HH:mm"
  )

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {agendamento.servico.secretaria.icone}{" "}
            {agendamento.servico.secretaria.sigla}
          </span>
          <h3 className="font-semibold text-card-foreground">
            {agendamento.servico.nome}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            STATUS_COLORS[agendamento.status]
          )}
        >
          {STATUS_LABELS[agendamento.status]}
        </span>
      </div>

      <div className="mb-3 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{dataFormatada}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{horaFormatada}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{agendamento.unidade.nome}</span>
        </div>
      </div>

      {canCancel && onCancel && (
        <button
          onClick={onCancel}
          className="w-full rounded-lg border border-destructive/30 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Cancelar agendamento
        </button>
      )}
    </div>
  )
}
