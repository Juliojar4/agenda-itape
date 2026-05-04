import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { startOfDay, endOfDay } from "date-fns"
import { AgendamentosTable } from "./agendamentos-table"

export const metadata = { title: "Agendamentos — Painel Admin" }

export default async function PainelAgendamentosPage() {
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
      ? { unidadeId }
      : {}),
  }

  const [agendamentos, unidades] = await Promise.all([
    prisma.agendamento.findMany({
      where: whereBase,
      include: {
        cidadao: { select: { id: true, nome: true, cpf: true, telefone: true } },
        servico: { include: { secretaria: true } },
        unidade: true,
      },
      orderBy: { horaAgendamento: "asc" },
    }),
    perfilNome !== "ATENDENTE"
      ? prisma.unidadeAtendimento.findMany({
          where: { ativo: true },
          orderBy: { nome: "asc" },
        })
      : Promise.resolve([]),
  ])

  return (
    <AgendamentosTable
      agendamentos={JSON.parse(JSON.stringify(agendamentos))}
      unidades={JSON.parse(JSON.stringify(unidades))}
      isAtendente={perfilNome === "ATENDENTE"}
    />
  )
}
