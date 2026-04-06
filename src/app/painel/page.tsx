import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { startOfDay, endOfDay } from "date-fns"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Users,
} from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS } from "@/constants"
import { cn } from "@/lib/utils"

export const metadata = { title: "Dashboard — Painel Admin" }

export default async function PainelDashboard() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
    redirect("/painel/login")
  }

  const unidadeId = (session.user as { unidadeId?: string }).unidadeId
  const perfilNome = (session.user as { perfilNome?: string }).perfilNome

  const hoje = new Date()
  const inicio = startOfDay(hoje)
  const fim = endOfDay(hoje)

  const whereBase = {
    dataAgendamento: { gte: inicio, lte: fim },
    ...(perfilNome === "ATENDENTE" && unidadeId
      ? { unidadeId: Number(unidadeId) }
      : {}),
  }

  const [total, agendado, confirmado, realizado, naoCompareceu, proximosHoje] =
    await Promise.all([
      prisma.agendamento.count({ where: whereBase }),
      prisma.agendamento.count({ where: { ...whereBase, status: "AGENDADO" } }),
      prisma.agendamento.count({ where: { ...whereBase, status: "CONFIRMADO" } }),
      prisma.agendamento.count({ where: { ...whereBase, status: "REALIZADO" } }),
      prisma.agendamento.count({ where: { ...whereBase, status: "NAO_COMPARECEU" } }),
      prisma.agendamento.findMany({
        where: {
          ...whereBase,
          status: { in: ["AGENDADO", "CONFIRMADO"] },
        },
        include: {
          cidadao: { select: { nome: true } },
          servico: { select: { nome: true } },
          unidade: { select: { nome: true } },
        },
        orderBy: { horaAgendamento: "asc" },
        take: 5,
      }),
    ])

  const dataHoje = format(hoje, "EEEE, dd 'de' MMMM", { locale: ptBR })

  const stats = [
    {
      label: "Total Hoje",
      value: total,
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Pendentes",
      value: agendado + confirmado,
      icon: Clock,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Realizados",
      value: realizado,
      icon: CheckCircle,
      color: "text-success bg-success/10",
    },
    {
      label: "Nao Compareceu",
      value: naoCompareceu,
      icon: XCircle,
      color: "text-destructive bg-destructive/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm capitalize text-muted-foreground">{dataHoje}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={cn("mb-2 inline-flex rounded-lg p-2", stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/painel/agendamentos"
          className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Agendamentos de Hoje</p>
              <p className="text-xs text-muted-foreground">
                {agendado + confirmado} pendentes
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/painel/agenda"
          className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-dark">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Gerir Agenda</p>
              <p className="text-xs text-muted-foreground">Criar e gerenciar slots</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Upcoming appointments */}
      {proximosHoje.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Proximos de Hoje
            </h2>
            <Link
              href="/painel/agendamentos"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {proximosHoje.map((ag) => (
              <div
                key={ag.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
              >
                <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                  {format(new Date(ag.horaAgendamento), "HH:mm")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {ag.cidadao.nome}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ag.servico.nome} · {ag.unidade.nome}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_COLORS[ag.status]
                  )}
                >
                  {STATUS_LABELS[ag.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
