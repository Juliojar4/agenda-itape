import { MongoClient } from "mongodb"
import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"

const mongoUrl = process.env.MONGODB_URL
const dbName = "agenda_facil"

if (!mongoUrl) {
  console.error("MONGODB_URL não definida no .env")
  process.exit(1)
}

const prisma = new PrismaClient()

// Mapas oldId → newId por collection
const idMap: Record<string, Map<string, string>> = {
  perfil_acesso: new Map(),
  secretaria: new Map(),
  unidade_atendimento: new Map(),
  servico: new Map(),
  cidadao: new Map(),
  usuario: new Map(),
  agenda: new Map(),
  agendamento: new Map(),
  atendimento: new Map(),
  notificacao: new Map(),
  log_auditoria: new Map(),
}

function newId(): string {
  return randomUUID().replace(/-/g, "")
}

function resolve(collection: string, oldId: string | null | undefined): string | null {
  if (!oldId) return null
  const mapped = idMap[collection].get(String(oldId))
  if (!mapped) throw new Error(`ID não mapeado: ${oldId} em ${collection}`)
  return mapped
}

async function main() {
  const mongo = new MongoClient(mongoUrl!)
  await mongo.connect()
  const db = mongo.db(dbName)
  console.log("Conectado ao MongoDB. Iniciando migração...\n")

  // 1. PerfilAcesso
  const perfis = await db.collection("perfil_acesso").find().toArray()
  for (const doc of perfis) {
    const id = newId()
    idMap.perfil_acesso.set(String(doc._id), id)
    await prisma.perfilAcesso.create({
      data: { id, nome: doc.nome, descricao: doc.descricao ?? null },
    })
  }
  console.log(`✔ perfil_acesso: ${perfis.length} registros`)

  // 2. Secretaria
  const secretarias = await db.collection("secretaria").find().toArray()
  for (const doc of secretarias) {
    const id = newId()
    idMap.secretaria.set(String(doc._id), id)
    await prisma.secretaria.create({
      data: {
        id,
        nome: doc.nome,
        sigla: doc.sigla,
        telefone: doc.telefone ?? null,
        email: doc.email ?? null,
        icone: doc.icone ?? "🏛️",
        ativo: doc.ativo ?? true,
        createdAt: doc.data_cadastro ?? new Date(),
      },
    })
  }
  console.log(`✔ secretaria: ${secretarias.length} registros`)

  // 3. UnidadeAtendimento
  const unidades = await db.collection("unidade_atendimento").find().toArray()
  for (const doc of unidades) {
    const id = newId()
    idMap.unidade_atendimento.set(String(doc._id), id)
    await prisma.unidadeAtendimento.create({
      data: {
        id,
        secretariaId: resolve("secretaria", String(doc.id_secretaria))!,
        nome: doc.nome,
        endereco: doc.endereco,
        bairro: doc.bairro,
        cep: doc.cep ?? null,
        telefone: doc.telefone ?? null,
        latitude: doc.latitude ?? null,
        longitude: doc.longitude ?? null,
        ativo: doc.ativo ?? true,
      },
    })
  }
  console.log(`✔ unidade_atendimento: ${unidades.length} registros`)

  // 4. Servico
  const servicos = await db.collection("servico").find().toArray()
  for (const doc of servicos) {
    const id = newId()
    idMap.servico.set(String(doc._id), id)
    await prisma.servico.create({
      data: {
        id,
        secretariaId: resolve("secretaria", String(doc.id_secretaria))!,
        nome: doc.nome,
        descricao: doc.descricao ?? null,
        tempoMedioMinutos: doc.tempo_medio_minutos ?? 30,
        documentosNecessarios: doc.documentos_necessarios ?? null,
        ativo: doc.ativo ?? true,
        createdAt: doc.data_cadastro ?? new Date(),
      },
    })
  }
  console.log(`✔ servico: ${servicos.length} registros`)

  // 5. Cidadao
  const cidadaos = await db.collection("cidadao").find().toArray()
  for (const doc of cidadaos) {
    const id = newId()
    idMap.cidadao.set(String(doc._id), id)
    await prisma.cidadao.create({
      data: {
        id,
        nome: doc.nome,
        cpf: doc.cpf,
        dataNascimento: doc.data_nascimento,
        sexo: doc.sexo,
        endereco: doc.endereco ?? null,
        bairro: doc.bairro ?? null,
        cep: doc.cep ?? null,
        telefone: doc.telefone ?? null,
        email: doc.email ?? null,
        senhaHash: doc.senha_hash,
        aceiteLgpd: doc.aceite_lgpd ?? false,
        aceiteNotificacoes: doc.aceite_notificacoes ?? true,
        ativo: doc.ativo ?? true,
        createdAt: doc.data_cadastro ?? new Date(),
      },
    })
  }
  console.log(`✔ cidadao: ${cidadaos.length} registros`)

  // 6. Usuario
  const usuarios = await db.collection("usuario").find().toArray()
  for (const doc of usuarios) {
    const id = newId()
    idMap.usuario.set(String(doc._id), id)
    await prisma.usuario.create({
      data: {
        id,
        nome: doc.nome,
        cpf: doc.cpf,
        email: doc.email,
        senhaHash: doc.senha_hash,
        perfilId: resolve("perfil_acesso", String(doc.id_perfil))!,
        secretariaId: doc.id_secretaria ? resolve("secretaria", String(doc.id_secretaria)) : null,
        unidadeId: doc.id_unidade ? resolve("unidade_atendimento", String(doc.id_unidade)) : null,
        ativo: doc.ativo ?? true,
        tentativasLogin: doc.tentativas_login ?? 0,
        bloqueadoAte: doc.bloqueado_ate ?? null,
        createdAt: doc.data_cadastro ?? new Date(),
      },
    })
  }
  console.log(`✔ usuario: ${usuarios.length} registros`)

  // 7. Agenda
  const agendas = await db.collection("agenda").find().toArray()
  for (const doc of agendas) {
    const id = newId()
    idMap.agenda.set(String(doc._id), id)
    await prisma.agenda.create({
      data: {
        id,
        servicoId: resolve("servico", String(doc.id_servico))!,
        unidadeId: resolve("unidade_atendimento", String(doc.id_unidade))!,
        dataDisponivel: doc.data_disponivel,
        horaInicio: doc.hora_inicio,
        horaFim: doc.hora_fim,
        vagasTotal: doc.vagas_total ?? 1,
        vagasDisponiveis: doc.vagas_disponiveis ?? 1,
        ativo: doc.ativo ?? true,
      },
    })
  }
  console.log(`✔ agenda: ${agendas.length} registros`)

  // 8. Agendamento
  const agendamentos = await db.collection("agendamento").find().toArray()
  for (const doc of agendamentos) {
    const id = newId()
    idMap.agendamento.set(String(doc._id), id)
    await prisma.agendamento.create({
      data: {
        id,
        cidadaoId: resolve("cidadao", String(doc.id_cidadao))!,
        agendaId: resolve("agenda", String(doc.id_agenda))!,
        servicoId: resolve("servico", String(doc.id_servico))!,
        unidadeId: resolve("unidade_atendimento", String(doc.id_unidade))!,
        dataAgendamento: doc.data_agendamento,
        horaAgendamento: doc.hora_agendamento,
        status: doc.status ?? "AGENDADO",
        motivoCancelamento: doc.motivo_cancelamento ?? null,
        createdAt: doc.data_criacao ?? new Date(),
        updatedAt: doc.data_atualizacao ?? new Date(),
      },
    })
  }
  console.log(`✔ agendamento: ${agendamentos.length} registros`)

  // 9. Atendimento
  const atendimentos = await db.collection("atendimento").find().toArray()
  for (const doc of atendimentos) {
    const id = newId()
    idMap.atendimento.set(String(doc._id), id)
    await prisma.atendimento.create({
      data: {
        id,
        agendamentoId: resolve("agendamento", String(doc.id_agendamento))!,
        usuarioAtendenteId: resolve("usuario", String(doc.id_usuario_atendente))!,
        status: doc.status,
        tempoEfetivoMinutos: doc.tempo_efetivo_minutos ?? null,
        observacoes: doc.observacoes ?? null,
        createdAt: doc.data_registro ?? new Date(),
      },
    })
  }
  console.log(`✔ atendimento: ${atendimentos.length} registros`)

  // 10. Notificacao
  const notificacoes = await db.collection("notificacao").find().toArray()
  for (const doc of notificacoes) {
    const id = newId()
    idMap.notificacao.set(String(doc._id), id)
    await prisma.notificacao.create({
      data: {
        id,
        cidadaoId: resolve("cidadao", String(doc.id_cidadao))!,
        agendamentoId: doc.id_agendamento ? resolve("agendamento", String(doc.id_agendamento)) : null,
        tipo: doc.tipo,
        canal: doc.canal ?? "EMAIL",
        titulo: doc.titulo,
        mensagem: doc.mensagem,
        enviada: doc.enviada ?? false,
        dataEnvio: doc.data_envio ?? null,
        createdAt: doc.data_criacao ?? new Date(),
      },
    })
  }
  console.log(`✔ notificacao: ${notificacoes.length} registros`)

  // 11. LogAuditoria
  const logs = await db.collection("log_auditoria").find().toArray()
  for (const doc of logs) {
    const id = newId()
    idMap.log_auditoria.set(String(doc._id), id)
    await prisma.logAuditoria.create({
      data: {
        id,
        usuarioId: doc.id_usuario ? resolve("usuario", String(doc.id_usuario)) : null,
        acao: doc.acao,
        tabelaAfetada: doc.tabela_afetada ?? null,
        registroId: doc.registro_id ?? null,
        dadosAnteriores: doc.dados_anteriores ?? null,
        dadosNovos: doc.dados_novos ?? null,
        ipOrigem: doc.ip_origem ?? null,
        createdAt: doc.data_registro ?? new Date(),
      },
    })
  }
  console.log(`✔ log_auditoria: ${logs.length} registros`)

  await mongo.close()
  console.log("\n✅ Migração concluída com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro na migração:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
