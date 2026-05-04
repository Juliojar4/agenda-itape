import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageContainer } from "@/components/layout/page-container"
import { HomeContent } from "./home-content"

export const metadata = {
  title: "Inicio",
}

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const cidadaoId = session.user.id

  const proximoAgendamento = await prisma.agendamento.findFirst({
    where: {
      cidadaoId,
      status: { in: ["AGENDADO", "CONFIRMADO"] },
      dataAgendamento: { gte: new Date() },
    },
    include: {
      servico: { include: { secretaria: true } },
      unidade: true,
      agenda: true,
    },
    orderBy: { dataAgendamento: "asc" },
  })

  const secretarias = await prisma.secretaria.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  })

  return (
    <PageContainer>
      <HomeContent
        userName={session.user.name || "Cidadao"}
        userCpf={(session.user as { cpf?: string }).cpf || ""}
        proximoAgendamento={proximoAgendamento ? JSON.parse(JSON.stringify(proximoAgendamento)) : null}
        secretarias={JSON.parse(JSON.stringify(secretarias))}
      />
    </PageContainer>
  )
}
