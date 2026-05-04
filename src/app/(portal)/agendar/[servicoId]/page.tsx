"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, MapPin, Clock, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"
import { DateSelector } from "@/components/agendamento/date-selector"
import { TimeGrid } from "@/components/agendamento/time-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { useCriarAgendamento } from "@/hooks/use-agendamentos"
import type { ServicoComSecretaria, SlotHorario } from "@/types"

type AgendaData = Record<
  string,
  {
    data: string
    unidade: { id: string; nome: string; endereco: string; bairro: string }
    slots: SlotHorario[]
  }[]
>

export default function AgendarPage({
  params,
}: {
  params: Promise<{ servicoId: string }>
}) {
  const { servicoId } = use(params)
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedUnidade, setSelectedUnidade] = useState<{
    id: string
    nome: string
  } | null>(null)

  const criarAgendamento = useCriarAgendamento()

  const { data: servico, isLoading: loadingServico } =
    useQuery<ServicoComSecretaria>({
      queryKey: ["servico", servicoId],
      queryFn: async () => {
        const res = await fetch(`/api/servicos?id=${servicoId}`)
        const data = await res.json()
        return Array.isArray(data) ? data.find((s: ServicoComSecretaria) => s.id === servicoId) : data
      },
    })

  const { data: agenda, isLoading: loadingAgenda } = useQuery<AgendaData>({
    queryKey: ["agenda", servicoId],
    queryFn: async () => {
      const res = await fetch(`/api/agenda/${servicoId}`)
      if (!res.ok) throw new Error("Erro ao carregar agenda")
      return res.json()
    },
  })

  const dates = agenda
    ? Object.keys(agenda)
        .sort()
        .map((d) => new Date(d + "T12:00:00"))
    : []

  const selectedDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null

  const dayEntries = selectedDateStr && agenda ? agenda[selectedDateStr] || [] : []

  // Reset slot when date changes
  useEffect(() => {
    setSelectedSlot(null)
    setSelectedUnidade(null)
  }, [selectedDate])

  const selectedSlotData = dayEntries
    .flatMap((e) => e.slots.map((s) => ({ ...s, unidade: e.unidade })))
    .find((s) => s.agendaId === selectedSlot)

  async function handleConfirm() {
    if (!selectedSlot || !selectedSlotData) return

    try {
      const result = await criarAgendamento.mutateAsync({
        agendaId: selectedSlot,
        servicoId,
        unidadeId: selectedSlotData.unidade.id,
      })
      toast.success("Agendamento realizado com sucesso!")
      router.push(`/confirmacao/${result.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao agendar"
      )
    }
  }

  return (
    <PageContainer>
      <Link
        href="/servicos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      {loadingServico ? (
        <Skeleton className="mb-4 h-28 w-full" />
      ) : servico ? (
        <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
          <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {servico.secretaria.icone} {servico.secretaria.sigla}
          </span>
          <h1 className="text-lg font-bold">{servico.nome}</h1>
          {servico.descricao && (
            <p className="mt-1 text-sm text-muted-foreground">
              {servico.descricao}
            </p>
          )}
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {servico.tempoMedioMinutos} min
            </span>
          </div>
          {servico.documentosNecessarios && (
            <div className="mt-3 rounded-lg bg-muted p-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium">
                <FileText className="h-3.5 w-3.5" />
                Documentos necessarios
              </p>
              <p className="text-xs text-muted-foreground">
                {servico.documentosNecessarios}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Date selection */}
      <div className="mb-4">
        <h2 className="mb-2 text-sm font-semibold">Escolha a data</h2>
        {loadingAgenda ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-14 shrink-0 rounded-xl" />
            ))}
          </div>
        ) : dates.length > 0 ? (
          <DateSelector
            dates={dates}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma data disponivel no momento
          </p>
        )}
      </div>

      {/* Time grid per unidade */}
      {selectedDate && dayEntries.length > 0 && (
        <div className="mb-4 space-y-4">
          {dayEntries.map((entry) => (
            <div key={entry.unidade.id}>
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{entry.unidade.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.unidade.endereco}
                  </p>
                </div>
              </div>
              <TimeGrid
                slots={entry.slots}
                selectedSlot={selectedSlot}
                onSelect={(id) => {
                  setSelectedSlot(id)
                  setSelectedUnidade(entry.unidade)
                }}
              />
            </div>
          ))}
        </div>
      )}

      {selectedDate && dayEntries.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhum horario disponivel nesta data
        </p>
      )}

      {/* Confirmation card */}
      {selectedSlotData && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
          <div className="mx-auto max-w-lg">
            <div className="mb-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">
                  {format(selectedDate!, "dd/MM/yyyy")} as{" "}
                  {selectedSlotData.hora}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedSlotData.unidade.nome}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <button
              onClick={handleConfirm}
              disabled={criarAgendamento.isPending}
              className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-50"
            >
              {criarAgendamento.isPending
                ? "Agendando..."
                : "Confirmar agendamento"}
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
