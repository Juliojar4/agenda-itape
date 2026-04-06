"use client"

import { useQuery } from "@tanstack/react-query"
import type { ServicoComSecretaria, Secretaria } from "@/types"

async function fetchServicos(secretariaId?: number | null): Promise<ServicoComSecretaria[]> {
  const params = secretariaId ? `?secretariaId=${secretariaId}` : ""
  const res = await fetch(`/api/servicos${params}`)
  if (!res.ok) throw new Error("Erro ao carregar servicos")
  return res.json()
}

export function useServicos(secretariaId?: number | null) {
  return useQuery({
    queryKey: ["servicos", secretariaId],
    queryFn: () => fetchServicos(secretariaId),
  })
}

export function useSecretarias() {
  const { data: servicos, ...rest } = useServicos()
  const secretarias: Secretaria[] = []
  const seen = new Set<number>()
  servicos?.forEach((s) => {
    if (!seen.has(s.secretaria.id)) {
      seen.add(s.secretaria.id)
      secretarias.push(s.secretaria)
    }
  })
  return { data: secretarias, ...rest }
}
