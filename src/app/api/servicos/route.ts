import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secretariaId = searchParams.get("secretariaId")

    const servicos = await prisma.servico.findMany({
      where: {
        ativo: true,
        ...(secretariaId ? { secretariaId } : {}),
      },
      include: {
        secretaria: true,
      },
      orderBy: [{ secretariaId: "asc" }, { nome: "asc" }],
    })

    return NextResponse.json(servicos)
  } catch (error) {
    console.error("Erro ao buscar servicos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
