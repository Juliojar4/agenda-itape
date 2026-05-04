import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, Calendar, Clock, MapPin, FileText } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"

export const metadata = {
  title: "Agendamento Confirmado",
}

export default async function ConfirmacaoPage({
  params,
}: {
  params: Promise<{ agendamentoId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { agendamentoId } = await params

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
    include: {
      servico: { include: { secretaria: true } },
      unidade: true,
      agenda: true,
    },
  })

  if (!agendamento || agendamento.cidadaoId !== session.user.id) {
    redirect("/meus-agendamentos")
  }

  const dataFormatada = format(
    new Date(agendamento.dataAgendamento),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )
  const horaFormatada = format(new Date(agendamento.horaAgendamento), "HH:mm")

  return (
    <PageContainer>
      <div className="flex flex-col items-center py-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <h1 className="mb-1 text-xl font-bold text-card-foreground">
          Agendamento confirmado!
        </h1>
        <p className="mb-1 text-sm text-muted-foreground">
          Seu atendimento foi agendado com sucesso.
        </p>
        <p className="mb-6 rounded-full bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">
          Protocolo #{String(agendamento.id).padStart(6, "0")}
        </p>
      </div>

      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-card-foreground">
          Detalhes do agendamento
        </h2>
        <div className="space-y-3">
          <div>
            <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {agendamento.servico.secretaria.icone}{" "}
              {agendamento.servico.secretaria.sigla}
            </span>
            <p className="font-medium">{agendamento.servico.nome}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span>{dataFormatada}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span>{horaFormatada}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p>{agendamento.unidade.nome}</p>
              <p className="text-xs">{agendamento.unidade.endereco}</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
            Status: Agendado
          </div>
        </div>
      </div>

      {agendamento.servico.documentosNecessarios && (
        <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Documentos necessarios
          </h2>
          <p className="text-sm text-muted-foreground">
            {agendamento.servico.documentosNecessarios}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/meus-agendamentos"
          className="flex-1 rounded-lg border border-primary py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Meus Agendamentos
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-lg bg-primary py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-light"
        >
          Inicio
        </Link>
      </div>
    </PageContainer>
  )
}
