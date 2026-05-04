import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dataParam = searchParams.get("data")
    const unidadeId = (session.user as { unidadeId?: string }).unidadeId
    const perfilNome = (session.user as { perfilNome?: string }).perfilNome

    const data = dataParam ? new Date(dataParam) : new Date()
    const inicio = startOfDay(data)
    const fim = endOfDay(data)

    const whereBase = {
      dataAgendamento: { gte: inicio, lte: fim },
      ...(perfilNome === "ATENDENTE" && unidadeId
        ? { unidadeId }
        : {}),
    }

    const [total, agendado, confirmado, realizado, naoCompareceu, cancelado] =
      await Promise.all([
        prisma.agendamento.count({ where: whereBase }),
        prisma.agendamento.count({ where: { ...whereBase, status: "AGENDADO" } }),
        prisma.agendamento.count({ where: { ...whereBase, status: "CONFIRMADO" } }),
        prisma.agendamento.count({ where: { ...whereBase, status: "REALIZADO" } }),
        prisma.agendamento.count({ where: { ...whereBase, status: "NAO_COMPARECEU" } }),
        prisma.agendamento.count({
          where: {
            ...whereBase,
            status: { in: ["CANCELADO_CIDADAO", "CANCELADO_PREFEITURA"] },
          },
        }),
      ])

    return NextResponse.json({
      total,
      agendado,
      confirmado,
      realizado,
      naoCompareceu,
      cancelado,
    })
  } catch (error) {
    console.error("Erro ao buscar stats:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
