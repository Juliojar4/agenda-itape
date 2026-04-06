"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import {
  CheckCircle,
  UserCheck,
  UserX,
  XCircle,
  ChevronDown,
  User,
  Phone,
  MapPin,
} from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS } from "@/constants"
import { cn, formatCPF, formatPhone } from "@/lib/utils"

type Cidadao = { id: number; nome: string; cpf: string; telefone: string | null }
type Servico = { nome: string; secretaria: { sigla: string; icone: string } }
type Unidade = { id: number; nome: string }

type Agendamento = {
  id: number
  status: string
  horaAgendamento: string
  cidadao: Cidadao
  servico: Servico
  unidade: Unidade
}

interface Props {
  agendamentos: Agendamento[]
  unidades: Unidade[]
  isAtendente: boolean
}

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "AGENDADO", label: "Agendado" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "REALIZADO", label: "Realizado" },
  { value: "NAO_COMPARECEU", label: "Nao Compareceu" },
  { value: "CANCELADO_CIDADAO", label: "Cancelado" },
  { value: "CANCELADO_PREFEITURA", label: "Cancelado Prefeitura" },
]

export function AgendamentosTable({ agendamentos: inicial, unidades, isAtendente }: Props) {
  const [agendamentos, setAgendamentos] = useState(inicial)
  const [statusFiltro, setStatusFiltro] = useState("")
  const [unidadeFiltro, setUnidadeFiltro] = useState("")
  const [expandido, setExpandido] = useState<number | null>(null)
  const [loading, setLoading] = useState<number | null>(null)

  const filtrados = agendamentos.filter((ag) => {
    if (statusFiltro && ag.status !== statusFiltro) return false
    if (unidadeFiltro && String(ag.unidade.id) !== unidadeFiltro) return false
    return true
  })

  async function atualizarStatus(
    id: number,
    status: string,
    extra?: { observacoes?: string; motivoCancelamento?: string }
  ) {
    setLoading(id)
    try {
      const res = await fetch(`/api/painel/agendamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao atualizar")
        return
      }

      const updated = await res.json()
      setAgendamentos((prev) =>
        prev.map((ag) => (ag.id === id ? { ...ag, status: updated.status } : ag))
      )
      setExpandido(null)
      toast.success("Status atualizado com sucesso")
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setLoading(null)
    }
  }

  const canAct = (status: string) =>
    status === "AGENDADO" || status === "CONFIRMADO"

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Agendamentos de Hoje</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {!isAtendente && unidades.length > 0 && (
          <select
            value={unidadeFiltro}
            onChange={(e) => setUnidadeFiltro(e.target.value)}
            className="rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as unidades</option>
            {unidades.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.nome}
              </option>
            ))}
          </select>
        )}

        <span className="ml-auto self-center text-sm text-muted-foreground">
          {filtrados.length} agendamento{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {filtrados.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum agendamento encontrado
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((ag) => {
            const isExpanded = expandido === ag.id
            const isLoading = loading === ag.id
            const active = canAct(ag.status)

            return (
              <div key={ag.id} className="rounded-xl border bg-card shadow-sm">
                {/* Row */}
                <button
                  onClick={() => setExpandido(isExpanded ? null : ag.id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                    {format(new Date(ag.horaAgendamento), "HH:mm")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {ag.servico.secretaria.icone} {ag.servico.secretaria.sigla}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold text-card-foreground">
                      {ag.cidadao.nome}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ag.servico.nome}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[ag.status]
                      )}
                    >
                      {STATUS_LABELS[ag.status]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t px-3 pb-3 pt-3">
                    <div className="mb-3 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>CPF: {formatCPF(ag.cidadao.cpf)}</span>
                      </div>
                      {ag.cidadao.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatPhone(ag.cidadao.telefone)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{ag.unidade.nome}</span>
                      </div>
                    </div>

                    {active && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={isLoading}
                          onClick={() => atualizarStatus(ag.id, "CONFIRMADO")}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Confirmar
                        </button>
                        <button
                          disabled={isLoading}
                          onClick={() => atualizarStatus(ag.id, "REALIZADO")}
                          className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Realizou
                        </button>
                        <button
                          disabled={isLoading}
                          onClick={() => atualizarStatus(ag.id, "NAO_COMPARECEU")}
                          className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Nao Compareceu
                        </button>
                        <button
                          disabled={isLoading}
                          onClick={() =>
                            atualizarStatus(ag.id, "CANCELADO_PREFEITURA", {
                              motivoCancelamento: "Cancelado pela unidade",
                            })
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
