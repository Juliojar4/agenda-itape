import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { criarAgendamentoSchema } from "@/lib/validators"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: { cidadaoId: Number(session.user.id) },
      include: {
        servico: { include: { secretaria: true } },
        unidade: true,
        agenda: true,
      },
      orderBy: { dataAgendamento: "desc" },
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = criarAgendamentoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { agendaId, servicoId, unidadeId } = parsed.data
    const cidadaoId = Number(session.user.id)

    // Check agenda exists and has availability
    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
    })

    if (!agenda || !agenda.ativo || agenda.vagasDisponiveis <= 0) {
      return NextResponse.json(
        { error: "Horario nao disponivel" },
        { status: 400 }
      )
    }

    // Check for duplicate booking at the same time
    const existingBooking = await prisma.agendamento.findFirst({
      where: {
        cidadaoId,
        dataAgendamento: agenda.dataDisponivel,
        horaAgendamento: agenda.horaInicio,
        status: { in: ["AGENDADO", "CONFIRMADO"] },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "Voce ja possui um agendamento neste horario" },
        { status: 409 }
      )
    }

    // Create agendamento and decrement vaga in a transaction
    const agendamento = await prisma.$transaction(async (tx) => {
      const updated = await tx.agenda.update({
        where: { id: agendaId, vagasDisponiveis: { gt: 0 } },
        data: { vagasDisponiveis: { decrement: 1 } },
      })

      if (!updated) {
        throw new Error("Horario nao disponivel")
      }

      return tx.agendamento.create({
        data: {
          cidadaoId,
          agendaId,
          servicoId,
          unidadeId,
          dataAgendamento: agenda.dataDisponivel,
          horaAgendamento: agenda.horaInicio,
          status: "AGENDADO",
        },
        include: {
          servico: { include: { secretaria: true } },
          unidade: true,
          agenda: true,
        },
      })
    })

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return NextResponse.json(
      { error: "Erro ao criar agendamento. Tente novamente." },
      { status: 500 }
    )
  }
}
