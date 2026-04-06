"use client"

import { useState } from "react"
import { CalendarX } from "lucide-react"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/page-container"
import { AgendamentoCard } from "@/components/agendamento/agendamento-card"
import { CancelDialog } from "@/components/agendamento/cancel-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAgendamentos, useCancelarAgendamento } from "@/hooks/use-agendamentos"
import type { AgendamentoCompleto } from "@/types"

export default function MeusAgendamentosPage() {
  const { data: agendamentos, isLoading } = useAgendamentos()
  const cancelar = useCancelarAgendamento()
  const [cancelTarget, setCancelTarget] = useState<AgendamentoCompleto | null>(
    null
  )

  async function handleCancel(motivo: string) {
    if (!cancelTarget) return
    try {
      await cancelar.mutateAsync({ id: cancelTarget.id, motivo })
      toast.success("Agendamento cancelado com sucesso")
      setCancelTarget(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cancelar"
      )
    }
  }

  return (
    <PageContainer>
      <h1 className="mb-1 text-lg font-bold">Meus agendamentos</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Acompanhe seus agendamentos
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : agendamentos && agendamentos.length > 0 ? (
        <div className="space-y-3">
          {agendamentos.map((ag) => (
            <AgendamentoCard
              key={ag.id}
              agendamento={ag}
              onCancel={
                ag.status === "AGENDADO"
                  ? () => setCancelTarget(ag)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <CalendarX className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="mb-1 font-medium text-card-foreground">
            Nenhum agendamento
          </p>
          <p className="text-sm text-muted-foreground">
            Voce ainda nao realizou nenhum agendamento.
          </p>
        </div>
      )}

      <CancelDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelar.isPending}
      />
    </PageContainer>
  )
}
