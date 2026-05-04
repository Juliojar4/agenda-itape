import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { addDays, isWeekend, isSaturday, isSunday, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns"

const prisma = new PrismaClient()

function makeTime(hours: number, minutes: number): Date {
  const d = new Date("1970-01-01T00:00:00.000Z")
  d.setUTCHours(hours, minutes, 0, 0)
  return d
}

function makeDate(date: Date): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, 0), 0), 0), 0)
}

async function main() {
  console.log("Seeding database...")

  // Secretarias
  const saude = await prisma.secretaria.create({
    data: { nome: "Secretaria de Saude", sigla: "SMS", telefone: "1532733000", email: "saude@itapetininga.sp.gov.br", icone: "\u{1F3E5}" },
  })
  const educacao = await prisma.secretaria.create({
    data: { nome: "Secretaria de Educacao", sigla: "SME", telefone: "1532733100", email: "educacao@itapetininga.sp.gov.br", icone: "\u{1F393}" },
  })
  const social = await prisma.secretaria.create({
    data: { nome: "Secretaria de Assistencia Social", sigla: "SMAS", telefone: "1532733200", email: "social@itapetininga.sp.gov.br", icone: "\u{1F91D}" },
  })
  const admin = await prisma.secretaria.create({
    data: { nome: "Secretaria de Administracao", sigla: "SMA", telefone: "1532733300", email: "admin@itapetininga.sp.gov.br", icone: "\u{1F3DB}\u{FE0F}" },
  })

  // Unidades de Atendimento
  const ubsCentral = await prisma.unidadeAtendimento.create({
    data: { secretariaId: saude.id, nome: "UBS Central", endereco: "Rua Cesario Motta, 433 - Centro", bairro: "Centro", cep: "18200010", telefone: "1532733010" },
  })
  const ubsEsperanca = await prisma.unidadeAtendimento.create({
    data: { secretariaId: saude.id, nome: "UBS Jardim Esperanca", endereco: "Rua das Flores, 120 - Jd. Esperanca", bairro: "Jardim Esperanca", cep: "18207000", telefone: "1532733020" },
  })
  const ubsMaringa = await prisma.unidadeAtendimento.create({
    data: { secretariaId: saude.id, nome: "UBS Jardim Maringa", endereco: "Av. Brasil, 500 - Jd. Maringa", bairro: "Jardim Maringa", cep: "18208000", telefone: "1532733030" },
  })
  const secEducacao = await prisma.unidadeAtendimento.create({
    data: { secretariaId: educacao.id, nome: "Secretaria de Educacao - Sede", endereco: "Rua Campos Sales, 100 - Centro", bairro: "Centro", cep: "18200020", telefone: "1532733110" },
  })
  const crasCentro = await prisma.unidadeAtendimento.create({
    data: { secretariaId: social.id, nome: "CRAS Centro", endereco: "Rua Major Alfredo, 250 - Centro", bairro: "Centro", cep: "18200030", telefone: "1532733210" },
  })
  const crasEsperanca = await prisma.unidadeAtendimento.create({
    data: { secretariaId: social.id, nome: "CRAS Jardim Esperanca", endereco: "Rua dos Lirios, 88 - Jd. Esperanca", bairro: "Jardim Esperanca", cep: "18207100", telefone: "1532733220" },
  })
  const pacoMunicipal = await prisma.unidadeAtendimento.create({
    data: { secretariaId: admin.id, nome: "Paco Municipal", endereco: "Praca dos Tres Poderes, 1 - Centro", bairro: "Centro", cep: "18200001", telefone: "1532733310" },
  })
  const protocoloGeral = await prisma.unidadeAtendimento.create({
    data: { secretariaId: admin.id, nome: "Protocolo Geral", endereco: "Rua Campos Sales, 50 - Centro", bairro: "Centro", cep: "18200002", telefone: "1532733320" },
  })

  // Servicos
  const svcClinico = await prisma.servico.create({
    data: { secretariaId: saude.id, nome: "Consulta Clinico Geral", descricao: "Consulta medica com clinico geral para atendimento de rotina e avaliacao de saude.", tempoMedioMinutos: 30, documentosNecessarios: "RG ou CNH, Cartao SUS, Comprovante de residencia" },
  })
  const svcOdonto = await prisma.servico.create({
    data: { secretariaId: saude.id, nome: "Consulta Odontologica", descricao: "Atendimento odontologico para avaliacao, limpeza e tratamentos dentarios.", tempoMedioMinutos: 40, documentosNecessarios: "RG ou CNH, Cartao SUS" },
  })
  const svcVacina = await prisma.servico.create({
    data: { secretariaId: saude.id, nome: "Vacinacao", descricao: "Aplicacao de vacinas conforme calendario nacional de imunizacao.", tempoMedioMinutos: 15, documentosNecessarios: "RG ou CNH, Cartao SUS, Carteira de Vacinacao" },
  })
  const svcMatricula = await prisma.servico.create({
    data: { secretariaId: educacao.id, nome: "Matricula Escolar", descricao: "Realizacao de matricula em escolas municipais para ensino infantil e fundamental.", tempoMedioMinutos: 30, documentosNecessarios: "RG do aluno, CPF do responsavel, Comprovante de residencia, Historico escolar, 2 fotos 3x4" },
  })
  const svcTransferencia = await prisma.servico.create({
    data: { secretariaId: educacao.id, nome: "Transferencia Escolar", descricao: "Solicitacao de transferencia entre escolas municipais.", tempoMedioMinutos: 20, documentosNecessarios: "RG do aluno, Declaracao de matricula da escola anterior, Comprovante de residencia" },
  })
  const svcCras = await prisma.servico.create({
    data: { secretariaId: social.id, nome: "Atendimento CRAS", descricao: "Atendimento socioassistencial para familias em situacao de vulnerabilidade social.", tempoMedioMinutos: 45, documentosNecessarios: "RG, CPF, Comprovante de residencia, Comprovante de renda" },
  })
  const svcCadUnico = await prisma.servico.create({
    data: { secretariaId: social.id, nome: "Cadastro Unico (CadUnico)", descricao: "Inscricao e atualizacao do Cadastro Unico para programas sociais do Governo Federal.", tempoMedioMinutos: 40, documentosNecessarios: "RG e CPF de todos da familia, Comprovante de residencia, Comprovante de renda, Certidao de nascimento dos menores" },
  })
  const svcCertidao = await prisma.servico.create({
    data: { secretariaId: admin.id, nome: "Emissao de Certidao", descricao: "Emissao de certidoes municipais (negativa de debitos, valor venal, uso do solo).", tempoMedioMinutos: 15, documentosNecessarios: "RG, CPF, Comprovante de residencia" },
  })
  const svcProtocolo = await prisma.servico.create({
    data: { secretariaId: admin.id, nome: "Protocolo Geral", descricao: "Abertura de protocolos e requerimentos junto a Prefeitura Municipal.", tempoMedioMinutos: 20, documentosNecessarios: "RG, CPF, Documento referente a solicitacao" },
  })

  // Perfis de Acesso
  const [perfilAdmin, , perfilAtendente] = await Promise.all([
    prisma.perfilAcesso.create({ data: { nome: "ADMINISTRADOR", descricao: "Acesso total ao sistema" } }),
    prisma.perfilAcesso.create({ data: { nome: "GESTOR", descricao: "Gestao de servicos e agendas da secretaria" } }),
    prisma.perfilAcesso.create({ data: { nome: "ATENDENTE", descricao: "Atendimento e registro de comparecimento" } }),
    prisma.perfilAcesso.create({ data: { nome: "CIDADAO", descricao: "Acesso ao portal do cidadao" } }),
  ])

  // Usuarios funcionarios demo
  const senhaFuncionario = await bcrypt.hash("admin123!", 10)
  await prisma.usuario.create({
    data: {
      nome: "Joao Administrador",
      cpf: "98765432100",
      email: "admin@itapetininga.sp.gov.br",
      senhaHash: senhaFuncionario,
      perfilId: perfilAdmin.id,
    },
  })
  await prisma.usuario.create({
    data: {
      nome: "Ana Atendente UBS Central",
      cpf: "11122233396",
      email: "atendente.ubs@itapetininga.sp.gov.br",
      senhaHash: senhaFuncionario,
      perfilId: perfilAtendente.id,
      secretariaId: saude.id,
      unidadeId: ubsCentral.id,
    },
  })

  // Cidadao demo
  const senhaHash = await bcrypt.hash("senha123", 10)
  const cidadaoDemo = await prisma.cidadao.create({
    data: {
      nome: "Maria da Silva",
      cpf: "12345678901",
      dataNascimento: new Date("1990-05-15"),
      sexo: "F",
      endereco: "Rua XV de Novembro, 200",
      bairro: "Centro",
      cep: "18200050",
      telefone: "15999001234",
      email: "maria@email.com",
      senhaHash,
      aceiteLgpd: true,
    },
  })

  // Servico -> Unidade mapping
  const servicoUnidadeMap: { servico: typeof svcClinico; unidades: (typeof ubsCentral)[] }[] = [
    { servico: svcClinico, unidades: [ubsCentral, ubsEsperanca, ubsMaringa] },
    { servico: svcOdonto, unidades: [ubsCentral, ubsEsperanca] },
    { servico: svcVacina, unidades: [ubsCentral, ubsEsperanca, ubsMaringa] },
    { servico: svcMatricula, unidades: [secEducacao] },
    { servico: svcTransferencia, unidades: [secEducacao] },
    { servico: svcCras, unidades: [crasCentro, crasEsperanca] },
    { servico: svcCadUnico, unidades: [crasCentro, crasEsperanca] },
    { servico: svcCertidao, unidades: [pacoMunicipal] },
    { servico: svcProtocolo, unidades: [protocoloGeral] },
  ]

  // Generate agendas for next 14 business days
  const today = new Date()
  const agendaIds: string[] = []

  for (const { servico, unidades } of servicoUnidadeMap) {
    for (const unidade of unidades) {
      let businessDays = 0
      let dayOffset = 1

      while (businessDays < 14) {
        const date = addDays(today, dayOffset)
        dayOffset++

        const isSundayDate = isSunday(date)
        const isSaturdayDate = isSaturday(date)
        const isWeekdayDate = !isWeekend(date)

        if (isSundayDate) continue
        businessDays++

        const dateOnly = makeDate(date)
        const slotDuration = servico.tempoMedioMinutos

        // Morning: 8h-11h
        const morningSlots: { start: number; end: number }[] = []
        let currentMin = 8 * 60
        const morningEnd = 11 * 60
        while (currentMin + slotDuration <= morningEnd) {
          morningSlots.push({ start: currentMin, end: currentMin + slotDuration })
          currentMin += slotDuration
        }

        // Afternoon (weekdays only): 13h-16h
        const afternoonSlots: { start: number; end: number }[] = []
        if (isWeekdayDate) {
          currentMin = 13 * 60
          const afternoonEnd = 16 * 60
          while (currentMin + slotDuration <= afternoonEnd) {
            afternoonSlots.push({ start: currentMin, end: currentMin + slotDuration })
            currentMin += slotDuration
          }
        }

        const allSlots = [...morningSlots, ...afternoonSlots]

        for (const slot of allSlots) {
          const agenda = await prisma.agenda.create({
            data: {
              servicoId: servico.id,
              unidadeId: unidade.id,
              dataDisponivel: dateOnly,
              horaInicio: makeTime(Math.floor(slot.start / 60), slot.start % 60),
              horaFim: makeTime(Math.floor(slot.end / 60), slot.end % 60),
              vagasTotal: 1,
              vagasDisponiveis: 1,
            },
          })
          agendaIds.push(agenda.id)
        }
      }
    }
  }

  // 5 Demo agendamentos
  const sampleAgendas = await prisma.agenda.findMany({
    where: { vagasDisponiveis: { gt: 0 } },
    include: { servico: true, unidade: true },
    take: 5,
    orderBy: { dataDisponivel: "asc" },
  })

  const statuses: string[] = [
    "AGENDADO",
    "AGENDADO",
    "REALIZADO",
    "NAO_COMPARECEU",
    "CANCELADO_CIDADAO",
  ]

  for (let i = 0; i < Math.min(5, sampleAgendas.length); i++) {
    const ag = sampleAgendas[i]
    await prisma.agendamento.create({
      data: {
        cidadaoId: cidadaoDemo.id,
        agendaId: ag.id,
        servicoId: ag.servicoId,
        unidadeId: ag.unidadeId,
        dataAgendamento: ag.dataDisponivel,
        horaAgendamento: ag.horaInicio,
        status: statuses[i],
        motivoCancelamento: statuses[i] === "CANCELADO_CIDADAO" ? "Nao poderei comparecer nesta data" : null,
      },
    })

    await prisma.agenda.update({
      where: { id: ag.id },
      data: { vagasDisponiveis: { decrement: 1 } },
    })
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
