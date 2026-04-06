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
    const statusParam = searchParams.get("status")
    const unidadeParam = searchParams.get("unidadeId")

    const unidadeId = (session.user as { unidadeId?: string }).unidadeId
    const perfilNome = (session.user as { perfilNome?: string }).perfilNome

    const data = dataParam ? new Date(dataParam) : new Date()
    const inicio = startOfDay(data)
    const fim = endOfDay(data)

    // Atendentes see only their unidade
    const unidadeFiltro =
      perfilNome === "ATENDENTE" && unidadeId
        ? Number(unidadeId)
        : unidadeParam
          ? Number(unidadeParam)
          : undefined

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataAgendamento: { gte: inicio, lte: fim },
        ...(statusParam ? { status: statusParam as never } : {}),
        ...(unidadeFiltro ? { unidadeId: unidadeFiltro } : {}),
      },
      include: {
        cidadao: {
          select: { id: true, nome: true, cpf: true, telefone: true },
        },
        servico: { include: { secretaria: true } },
        unidade: true,
      },
      orderBy: { horaAgendamento: "asc" },
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error("Erro ao buscar agendamentos painel:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
