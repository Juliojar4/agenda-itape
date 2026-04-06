import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const atualizarStatusSchema = z.object({
  status: z.enum(["CONFIRMADO", "REALIZADO", "NAO_COMPARECEU", "CANCELADO_PREFEITURA"]),
  observacoes: z.string().max(1000).optional(),
  motivoCancelamento: z.string().max(500).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { id } = await params
    const agendamentoId = Number(id)
    if (isNaN(agendamentoId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = atualizarStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { status, observacoes, motivoCancelamento } = parsed.data
    const usuarioId = Number(session.user.id)

    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
    })

    if (!agendamento) {
      return NextResponse.json({ error: "Agendamento nao encontrado" }, { status: 404 })
    }

    const statusAtivos = ["AGENDADO", "CONFIRMADO"]
    if (!statusAtivos.includes(agendamento.status)) {
      return NextResponse.json(
        { error: "Agendamento nao pode ser alterado no status atual" },
        { status: 409 }
      )
    }

    const atualizado = await prisma.$transaction(async (tx) => {
      const ag = await tx.agendamento.update({
        where: { id: agendamentoId },
        data: {
          status,
          ...(status === "CANCELADO_PREFEITURA"
            ? { motivoCancelamento: motivoCancelamento || "Cancelado pela prefeitura" }
            : {}),
        },
      })

      // Create Atendimento record for terminal statuses
      if (status === "REALIZADO" || status === "NAO_COMPARECEU") {
        await tx.atendimento.upsert({
          where: { agendamentoId },
          create: {
            agendamentoId,
            usuarioAtendenteId: usuarioId,
            status: status === "REALIZADO" ? "REALIZADO" : "NAO_COMPARECEU",
            observacoes,
          },
          update: {
            status: status === "REALIZADO" ? "REALIZADO" : "NAO_COMPARECEU",
            observacoes,
            usuarioAtendenteId: usuarioId,
          },
        })
      }

      // Restore slot if cancelled by prefeitura
      if (status === "CANCELADO_PREFEITURA") {
        await tx.agenda.update({
          where: { id: agendamento.agendaId },
          data: { vagasDisponiveis: { increment: 1 } },
        })
      }

      return ag
    })

    return NextResponse.json(atualizado)
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
