import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const cidadaoId = session.user.id

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
    })

    if (!agendamento || agendamento.cidadaoId !== cidadaoId) {
      return NextResponse.json(
        { error: "Agendamento nao encontrado" },
        { status: 404 }
      )
    }

    if (agendamento.status !== "AGENDADO") {
      return NextResponse.json(
        { error: "Apenas e agendamentos com status AGENDADO podem ser cancelados" },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Restore the slot
      await tx.agenda.update({
        where: { id: agendamento.agendaId },
        data: { vagasDisponiveis: { increment: 1 } },
      })

      return tx.agendamento.update({
        where: { id },
        data: {
          status: "CANCELADO_CIDADAO",
          motivoCancelamento: body.motivoCancelamento || null,
        },
        include: {
          servico: { include: { secretaria: true } },
          unidade: true,
          agenda: true,
        },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
