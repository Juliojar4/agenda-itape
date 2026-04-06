import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { addDays, startOfDay } from "date-fns"

const criarSlotSchema = z.object({
  servicoId: z.number().int().positive(),
  unidadeId: z.number().int().positive(),
  data: z.string().min(1),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  vagasTotal: z.number().int().min(1).max(50).default(1),
})

function makeTime(hh: string): Date {
  const [h, m] = hh.split(":").map(Number)
  const d = new Date("1970-01-01T00:00:00.000Z")
  d.setUTCHours(h, m, 0, 0)
  return d
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const servicoId = searchParams.get("servicoId")
    const unidadeId = searchParams.get("unidadeId")
    const hoje = startOfDay(new Date())
    const limite = addDays(hoje, 30)

    const agendas = await prisma.agenda.findMany({
      where: {
        dataDisponivel: { gte: hoje, lte: limite },
        ativo: true,
        ...(servicoId ? { servicoId: Number(servicoId) } : {}),
        ...(unidadeId ? { unidadeId: Number(unidadeId) } : {}),
      },
      include: {
        servico: { select: { id: true, nome: true } },
        unidade: { select: { id: true, nome: true } },
      },
      orderBy: [{ dataDisponivel: "asc" }, { horaInicio: "asc" }],
      take: 200,
    })

    return NextResponse.json(agendas)
  } catch (error) {
    console.error("Erro ao buscar agenda:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const perfilNome = (session?.user as { perfilNome?: string } | undefined)?.perfilNome
    if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }
    if (perfilNome === "ATENDENTE") {
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = criarSlotSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { servicoId, unidadeId, data, horaInicio, horaFim, vagasTotal } = parsed.data

    const dataDisponivel = startOfDay(new Date(data))
    const horaInicioDate = makeTime(horaInicio)
    const horaFimDate = makeTime(horaFim)

    // Check for duplicate slot
    const existing = await prisma.agenda.findFirst({
      where: { servicoId, unidadeId, dataDisponivel, horaInicio: horaInicioDate },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Ja existe um slot para este horario" },
        { status: 409 }
      )
    }

    const agenda = await prisma.agenda.create({
      data: {
        servicoId,
        unidadeId,
        dataDisponivel,
        horaInicio: horaInicioDate,
        horaFim: horaFimDate,
        vagasTotal,
        vagasDisponiveis: vagasTotal,
      },
      include: {
        servico: { select: { id: true, nome: true } },
        unidade: { select: { id: true, nome: true } },
      },
    })

    return NextResponse.json(agenda, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar slot:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
