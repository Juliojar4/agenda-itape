"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Plus, CalendarPlus, Users, Clock } from "lucide-react"

type Servico = { id: number; nome: string; secretaria: { sigla: string } }
type Unidade = { id: number; nome: string }
type Agenda = {
  id: number
  dataDisponivel: string
  horaInicio: string
  horaFim: string
  vagasTotal: number
  vagasDisponiveis: number
  servico: { id: number; nome: string }
  unidade: { id: number; nome: string }
  _count: { agendamentos: number }
}

interface Props {
  agendas: Agenda[]
  servicos: Servico[]
  unidades: Unidade[]
}

function toHHMM(isoTime: string): string {
  const d = new Date(isoTime)
  const h = String(d.getUTCHours()).padStart(2, "0")
  const m = String(d.getUTCMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export function AgendaManager({ agendas: inicial, servicos, unidades }: Props) {
  const [agendas, setAgendas] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [servicoFiltro, setServicoFiltro] = useState("")
  const [unidadeFiltro, setUnidadeFiltro] = useState("")

  const [form, setForm] = useState({
    servicoId: "",
    unidadeId: "",
    data: "",
    horaInicio: "08:00",
    horaFim: "08:30",
    vagasTotal: 1,
  })

  const filtradas = agendas.filter((ag) => {
    if (servicoFiltro && String(ag.servico.id) !== servicoFiltro) return false
    if (unidadeFiltro && String(ag.unidade.id) !== unidadeFiltro) return false
    return true
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.servicoId || !form.unidadeId || !form.data) {
      toast.error("Preencha todos os campos obrigatorios")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/painel/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicoId: Number(form.servicoId),
          unidadeId: Number(form.unidadeId),
          data: form.data,
          horaInicio: form.horaInicio,
          horaFim: form.horaFim,
          vagasTotal: Number(form.vagasTotal),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao criar slot")
        return
      }

      const novo = await res.json()
      setAgendas((prev) => [novo, ...prev])
      setShowForm(false)
      setForm({
        servicoId: "",
        unidadeId: "",
        data: "",
        horaInicio: "08:00",
        horaFim: "08:30",
        vagasTotal: 1,
      })
      toast.success("Slot criado com sucesso")
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setSaving(false)
    }
  }

  // Group by date
  const porData: Record<string, Agenda[]> = {}
  for (const ag of filtradas) {
    const d = ag.dataDisponivel.slice(0, 10)
    if (!porData[d]) porData[d] = []
    porData[d].push(ag)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestao de Agenda</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Proximos 14 dias uteis
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Novo Slot
        </button>
      </div>

      {/* New slot form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-primary" />
            Criar Novo Slot de Atendimento
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Servico *
              </label>
              <select
                value={form.servicoId}
                onChange={(e) => setForm((f) => ({ ...f, servicoId: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Selecione...</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.secretaria.sigla} — {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Unidade *
              </label>
              <select
                value={form.unidadeId}
                onChange={(e) => setForm((f) => ({ ...f, unidadeId: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Selecione...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Data *
              </label>
              <input
                type="date"
                value={form.data}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Vagas
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.vagasTotal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vagasTotal: Number(e.target.value) }))
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Hora Inicio *
              </label>
              <input
                type="time"
                value={form.horaInicio}
                onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Hora Fim *
              </label>
              <input
                type="time"
                value={form.horaFim}
                onChange={(e) => setForm((f) => ({ ...f, horaFim: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Criar Slot"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={servicoFiltro}
          onChange={(e) => setServicoFiltro(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos os servicos</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>

        <select
          value={unidadeFiltro}
          onChange={(e) => setUnidadeFiltro(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas as unidades</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>

        <span className="ml-auto self-center text-sm text-muted-foreground">
          {filtradas.length} slot{filtradas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Slots grouped by date */}
      {Object.keys(porData).length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <CalendarPlus className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum slot encontrado para os proximos dias
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(porData).map(([data, slots]) => (
            <div key={data}>
              <h3 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
                {format(new Date(data + "T12:00:00"), "EEEE, dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </h3>
              <div className="space-y-2">
                {slots.map((ag) => {
                  const ocupado = ag.vagasTotal - ag.vagasDisponiveis
                  const percentual =
                    ag.vagasTotal > 0 ? (ocupado / ag.vagasTotal) * 100 : 0

                  return (
                    <div
                      key={ag.id}
                      className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
                    >
                      <div className="flex h-10 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
                        <span className="text-xs font-bold text-foreground">
                          {toHHMM(ag.horaInicio)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {toHHMM(ag.horaFim)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {ag.servico.nome}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {ag.unidade.nome}
                        </p>
                        {/* Availability bar */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-accent transition-all"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {ocupado}/{ag.vagasTotal}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{ag.vagasDisponiveis} livre{ag.vagasDisponiveis !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{ag._count.agendamentos} agend.</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
