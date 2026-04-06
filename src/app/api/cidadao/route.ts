import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cadastroCidadaoSchema } from "@/lib/validators"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = cadastroCidadaoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { nome, cpf, dataNascimento, sexo, telefone, email, senha } = parsed.data

    const existing = await prisma.cidadao.findUnique({ where: { cpf } })
    if (existing) {
      return NextResponse.json(
        { error: "CPF ja cadastrado no sistema" },
        { status: 409 }
      )
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const cidadao = await prisma.cidadao.create({
      data: {
        nome,
        cpf,
        dataNascimento: new Date(dataNascimento),
        sexo,
        telefone,
        email: email || null,
        senhaHash,
        aceiteLgpd: true,
      },
    })

    return NextResponse.json(
      { id: cidadao.id, nome: cidadao.nome, cpf: cidadao.cpf },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao cadastrar cidadao:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
