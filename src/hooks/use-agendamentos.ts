"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AgendamentoCompleto } from "@/types"

async function fetchAgendamentos(): Promise<AgendamentoCompleto[]> {
  const res = await fetch("/api/agendamentos")
  if (!res.ok) throw new Error("Erro ao carregar agendamentos")
  return res.json()
}

export function useAgendamentos() {
  return useQuery({
    queryKey: ["agendamentos"],
    queryFn: fetchAgendamentos,
  })
}

export function useCancelarAgendamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      motivo,
    }: {
      id: string
      motivo?: string
    }) => {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELADO_CIDADAO",
          motivoCancelamento: motivo,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao cancelar")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] })
    },
  })
}

export function useCriarAgendamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      agendaId: string
      servicoId: string
      unidadeId: string
    }) => {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao criar agendamento")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] })
    },
  })
}
