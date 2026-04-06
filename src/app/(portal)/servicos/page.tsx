"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { SecretariaFilter } from "@/components/agendamento/secretaria-filter"
import { ServiceCard } from "@/components/agendamento/service-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useServicos, useSecretarias } from "@/hooks/use-servicos"

export default function ServicosPage() {
  const searchParams = useSearchParams()
  const initialSec = searchParams.get("sec")
  const [selectedSec, setSelectedSec] = useState<number | null>(
    initialSec ? Number(initialSec) : null
  )

  const { data: secretarias, isLoading: loadingSec } = useSecretarias()
  const { data: servicos, isLoading: loadingServicos } = useServicos(selectedSec)

  return (
    <PageContainer>
      <h1 className="mb-1 text-lg font-bold">Servicos disponiveis</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Escolha um servico para agendar
      </p>

      {loadingSec ? (
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <SecretariaFilter
            secretarias={secretarias || []}
            selected={selectedSec}
            onSelect={setSelectedSec}
          />
        </div>
      )}

      {loadingServicos ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : servicos && servicos.length > 0 ? (
        <div className="space-y-3">
          {servicos.map((s) => (
            <ServiceCard key={s.id} servico={s} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum servico encontrado
          </p>
        </div>
      )}
    </PageContainer>
  )
}
