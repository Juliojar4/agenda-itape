"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, MapPin, Info, ChevronRight } from "lucide-react"
import { formatCPF } from "@/lib/utils"
import type { AgendamentoCompleto, Secretaria } from "@/types"

interface HomeContentProps {
  userName: string
  userCpf: string
  proximoAgendamento: AgendamentoCompleto | null
  secretarias: Secretaria[]
}

export function HomeContent({
  userName,
  userCpf,
  proximoAgendamento,
  secretarias,
}: HomeContentProps) {
  return (
    <div className="space-y-4">
      {/* Welcome card */}
      <div className="rounded-xl bg-primary p-4 text-primary-foreground shadow-md">
        <p className="text-sm opacity-80">Bem-vindo(a),</p>
        <p className="text-lg font-bold">{userName}</p>
        <p className="mt-1 text-xs opacity-70">CPF: {formatCPF(userCpf)}</p>
      </div>

      {/* Next appointment */}
      {proximoAgendamento ? (
        <Link href="/meus-agendamentos">
          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-accent-dark">
                Proximo agendamento
              </span>
              <ChevronRight className="h-4 w-4 text-accent-dark" />
            </div>
            <p className="font-semibold text-card-foreground">
              {proximoAgendamento.servico.nome}
            </p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {format(
                  new Date(proximoAgendamento.dataAgendamento),
                  "dd 'de' MMMM",
                  { locale: ptBR }
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(proximoAgendamento.horaAgendamento), "HH:mm")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {proximoAgendamento.unidade.nome}
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Voce nao tem agendamentos proximos
          </p>
          <Link
            href="/servicos"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            Agendar um servico
          </Link>
        </div>
      )}

      {/* Quick access grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Acesso rapido
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {secretarias.map((sec) => (
            <Link key={sec.id} href={`/servicos?sec=${sec.id}`}>
              <div className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-none">
                <span className="mb-1 text-2xl">{sec.icone}</span>
                <span className="text-center text-xs font-medium text-card-foreground">
                  {sec.sigla}
                </span>
                <span className="text-center text-[10px] text-muted-foreground line-clamp-1">
                  {sec.nome.replace("Secretaria de ", "")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tip card */}
      <div className="flex gap-3 rounded-xl border bg-blue-50 p-4">
        <Info className="h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-card-foreground">Dica</p>
          <p className="text-xs text-muted-foreground">
            Cancele agendamentos com pelo menos 24h de antecedencia para liberar
            a vaga para outros cidadaos.
          </p>
        </div>
      </div>
    </div>
  )
}
