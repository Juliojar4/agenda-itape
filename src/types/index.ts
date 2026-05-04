import type {
  Secretaria,
  Servico,
  UnidadeAtendimento,
  Cidadao,
  Agenda,
  Agendamento,
} from "@prisma/client"

export type AgendamentoStatus =
  | "AGENDADO"
  | "CONFIRMADO"
  | "REALIZADO"
  | "NAO_COMPARECEU"
  | "CANCELADO_CIDADAO"
  | "CANCELADO_PREFEITURA"

export type ServicoComSecretaria = Servico & {
  secretaria: Secretaria
}

export type AgendamentoCompleto = Agendamento & {
  servico: Servico & { secretaria: Secretaria }
  unidade: UnidadeAtendimento
  agenda: Agenda
}

export type SlotHorario = {
  agendaId: string
  hora: string
  vagasDisponiveis: number
}

export type DiaDisponivel = {
  data: string
  slots: SlotHorario[]
}

export type { Secretaria, Servico, UnidadeAtendimento, Cidadao, Agenda, Agendamento }
