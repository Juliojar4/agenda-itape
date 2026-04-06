import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ servicoId: string }> }
) {
  try {
    const { servicoId } = await params
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get("mes")

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    let dataFim: Date
    if (mes) {
      const [year, month] = mes.split("-").map(Number)
      dataFim = new Date(year, month, 0) // last day of month
    } else {
      dataFim = new Date(hoje)
      dataFim.setDate(dataFim.getDate() + 30)
    }

    const agendas = await prisma.agenda.findMany({
      where: {
        servicoId: Number(servicoId),
        ativo: true,
        dataDisponivel: {
          gte: hoje,
          lte: dataFim,
        },
        vagasDisponiveis: { gt: 0 },
      },
      include: {
        unidade: true,
      },
      orderBy: [{ dataDisponivel: "asc" }, { horaInicio: "asc" }],
    })

    const grouped: Record<
      string,
      {
        data: string
        unidade: { id: number; nome: string; endereco: string; bairro: string }
        slots: { agendaId: number; hora: string; vagasDisponiveis: number }[]
      }[]
    > = {}

    for (const agenda of agendas) {
      const dataStr = format(new Date(agenda.dataDisponivel), "yyyy-MM-dd")
      if (!grouped[dataStr]) grouped[dataStr] = []

      let unidadeEntry = grouped[dataStr].find(
        (e) => e.unidade.id === agenda.unidadeId
      )
      if (!unidadeEntry) {
        unidadeEntry = {
          data: dataStr,
          unidade: {
            id: agenda.unidade.id,
            nome: agenda.unidade.nome,
            endereco: agenda.unidade.endereco,
            bairro: agenda.unidade.bairro,
          },
          slots: [],
        }
        grouped[dataStr].push(unidadeEntry)
      }

      unidadeEntry.slots.push({
        agendaId: agenda.id,
        hora: format(new Date(agenda.horaInicio), "HH:mm"),
        vagasDisponiveis: agenda.vagasDisponiveis,
      })
    }

    return NextResponse.json(grouped)
  } catch (error) {
    console.error("Erro ao buscar agenda:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
