import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { addDays, startOfDay } from "date-fns"
import { AgendaManager } from "./agenda-manager"

export const metadata = { title: "Gerir Agenda — Painel Admin" }

export default async function PainelAgendaPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
    redirect("/painel/login")
  }

  const perfilNome = (session.user as { perfilNome?: string }).perfilNome
  if (perfilNome === "ATENDENTE") {
    redirect("/painel")
  }

  const hoje = startOfDay(new Date())
  const limite = addDays(hoje, 14)

  const [agendas, servicos, unidades] = await Promise.all([
    prisma.agenda.findMany({
      where: { dataDisponivel: { gte: hoje, lte: limite }, ativo: true },
      include: {
        servico: { select: { id: true, nome: true } },
        unidade: { select: { id: true, nome: true } },
        _count: { select: { agendamentos: true } },
      },
      orderBy: [{ dataDisponivel: "asc" }, { horaInicio: "asc" }],
      take: 200,
    }),
    prisma.servico.findMany({
      where: { ativo: true },
      include: { secretaria: { select: { sigla: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.unidadeAtendimento.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
  ])

  return (
    <AgendaManager
      agendas={JSON.parse(JSON.stringify(agendas))}
      servicos={JSON.parse(JSON.stringify(servicos))}
      unidades={JSON.parse(JSON.stringify(unidades))}
    />
  )
}
