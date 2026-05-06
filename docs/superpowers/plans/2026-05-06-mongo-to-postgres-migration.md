# Migração MongoDB → PostgreSQL (Neon) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o banco de dados do projeto de MongoDB Atlas para PostgreSQL no Neon, preservando todos os dados existentes.

**Architecture:** O Prisma abstrai o banco — a lógica da aplicação não muda. Apenas o `schema.prisma` e o `.env` precisam ser atualizados para PostgreSQL. Um script único de migração lê os dados do Mongo e insere no Postgres via Prisma Client, mapeando ObjectIds antigos para novos cuid strings.

**Tech Stack:** Prisma 6, PostgreSQL (Neon), mongodb package (Node.js driver), TypeScript, tsx

---

## Mapa de Arquivos

| Arquivo | Ação | O que muda |
|---|---|---|
| `prisma/schema.prisma` | Modificar | Provider, IDs, foreign keys |
| `.env` | Modificar | DATABASE_URL + MONGODB_URL |
| `package.json` | Modificar | Novo script db:migrate; remover mongodb depois |
| `prisma/migrate-mongo-to-pg.ts` | Criar | Script único de migração de dados |

---

## Task 1: Atualizar `.env`

**Files:**
- Modify: `.env`

- [ ] **Step 1: Adicionar variáveis do Neon e renomear a MongoDB**

Abrir `.env` e substituir o conteúdo por:

```env
# PostgreSQL (Neon) — banco principal
DATABASE_URL="postgresql://neondb_owner:npg_0GXOmgvkHQh8@ep-old-snow-acxkg0mf.sa-east-1.aws.neon.tech/neondb?sslmode=require"

# MongoDB Atlas — usado apenas para o script de migração de dados
MONGODB_URL="mongodb+srv://juliojaraitape01_db_user:cLNMZ3Wc6OEvEyBr@cluster0.tjai8o2.mongodb.net/agenda_facil?appName=Cluster0"

AUTH_SECRET="dev-secret-agenda-facil-itape-prototipo-2026"
AUTH_URL="http://localhost:3000"
```

- [ ] **Step 2: Commit**

```bash
git add .env
git commit -m "chore: set Neon PostgreSQL as DATABASE_URL"
```

---

## Task 2: Atualizar `prisma/schema.prisma`

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Substituir o schema completo**

Substituir todo o conteúdo de `prisma/schema.prisma` por:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Secretaria {
  id        String   @id @default(cuid())
  nome      String
  sigla     String
  telefone  String?
  email     String?
  icone     String   @default("🏛️")
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now()) @map("data_cadastro")

  unidades UnidadeAtendimento[]
  servicos Servico[]
  usuarios Usuario[]

  @@map("secretaria")
}

model UnidadeAtendimento {
  id           String  @id @default(cuid())
  secretariaId String  @map("id_secretaria")
  nome         String
  endereco     String
  bairro       String
  cep          String?
  telefone     String?
  latitude     Float?
  longitude    Float?
  ativo        Boolean @default(true)

  secretaria   Secretaria    @relation(fields: [secretariaId], references: [id])
  agendas      Agenda[]
  agendamentos Agendamento[]
  usuarios     Usuario[]

  @@map("unidade_atendimento")
}

model Servico {
  id                    String   @id @default(cuid())
  secretariaId          String   @map("id_secretaria")
  nome                  String
  descricao             String?
  tempoMedioMinutos     Int      @default(30) @map("tempo_medio_minutos")
  documentosNecessarios String?  @map("documentos_necessarios")
  ativo                 Boolean  @default(true)
  createdAt             DateTime @default(now()) @map("data_cadastro")

  secretaria   Secretaria    @relation(fields: [secretariaId], references: [id])
  agendas      Agenda[]
  agendamentos Agendamento[]

  @@map("servico")
}

model Cidadao {
  id                 String   @id @default(cuid())
  nome               String
  cpf                String   @unique
  dataNascimento     DateTime @map("data_nascimento")
  sexo               String
  endereco           String?
  bairro             String?
  cep                String?
  telefone           String?
  email              String?
  senhaHash          String   @map("senha_hash")
  aceiteLgpd         Boolean  @default(false) @map("aceite_lgpd")
  aceiteNotificacoes Boolean  @default(true) @map("aceite_notificacoes")
  ativo              Boolean  @default(true)
  createdAt          DateTime @default(now()) @map("data_cadastro")

  agendamentos Agendamento[]
  notificacoes Notificacao[]

  @@map("cidadao")
}

model PerfilAcesso {
  id        String  @id @default(cuid())
  nome      String  @unique
  descricao String?

  usuarios Usuario[]

  @@map("perfil_acesso")
}

model Usuario {
  id              String    @id @default(cuid())
  nome            String
  cpf             String    @unique
  email           String    @unique
  senhaHash       String    @map("senha_hash")
  perfilId        String    @map("id_perfil")
  secretariaId    String?   @map("id_secretaria")
  unidadeId       String?   @map("id_unidade")
  ativo           Boolean   @default(true)
  tentativasLogin Int       @default(0) @map("tentativas_login")
  bloqueadoAte    DateTime? @map("bloqueado_ate")
  createdAt       DateTime  @default(now()) @map("data_cadastro")

  perfil       PerfilAcesso        @relation(fields: [perfilId], references: [id])
  secretaria   Secretaria?         @relation(fields: [secretariaId], references: [id])
  unidade      UnidadeAtendimento? @relation(fields: [unidadeId], references: [id])
  atendimentos Atendimento[]
  logs         LogAuditoria[]

  @@map("usuario")
}

model Agenda {
  id               String   @id @default(cuid())
  servicoId        String   @map("id_servico")
  unidadeId        String   @map("id_unidade")
  dataDisponivel   DateTime @map("data_disponivel")
  horaInicio       DateTime @map("hora_inicio")
  horaFim          DateTime @map("hora_fim")
  vagasTotal       Int      @default(1) @map("vagas_total")
  vagasDisponiveis Int      @default(1) @map("vagas_disponiveis")
  ativo            Boolean  @default(true)

  servico      Servico            @relation(fields: [servicoId], references: [id])
  unidade      UnidadeAtendimento @relation(fields: [unidadeId], references: [id])
  agendamentos Agendamento[]

  @@map("agenda")
}

model Agendamento {
  id                 String   @id @default(cuid())
  cidadaoId          String   @map("id_cidadao")
  agendaId           String   @map("id_agenda")
  servicoId          String   @map("id_servico")
  unidadeId          String   @map("id_unidade")
  dataAgendamento    DateTime @map("data_agendamento")
  horaAgendamento    DateTime @map("hora_agendamento")
  status             String   @default("AGENDADO")
  motivoCancelamento String?  @map("motivo_cancelamento")
  createdAt          DateTime @default(now()) @map("data_criacao")
  updatedAt          DateTime @updatedAt @map("data_atualizacao")

  cidadao      Cidadao            @relation(fields: [cidadaoId], references: [id])
  agenda       Agenda             @relation(fields: [agendaId], references: [id])
  servico      Servico            @relation(fields: [servicoId], references: [id])
  unidade      UnidadeAtendimento @relation(fields: [unidadeId], references: [id])
  atendimento  Atendimento?
  notificacoes Notificacao[]

  @@map("agendamento")
}

model Atendimento {
  id                  String   @id @default(cuid())
  agendamentoId       String   @unique @map("id_agendamento")
  usuarioAtendenteId  String   @map("id_usuario_atendente")
  status              String
  tempoEfetivoMinutos Int?     @map("tempo_efetivo_minutos")
  observacoes         String?
  createdAt           DateTime @default(now()) @map("data_registro")

  agendamento Agendamento @relation(fields: [agendamentoId], references: [id])
  atendente   Usuario     @relation(fields: [usuarioAtendenteId], references: [id])

  @@map("atendimento")
}

model Notificacao {
  id            String    @id @default(cuid())
  cidadaoId     String    @map("id_cidadao")
  agendamentoId String?   @map("id_agendamento")
  tipo          String
  canal         String    @default("EMAIL")
  titulo        String
  mensagem      String
  enviada       Boolean   @default(false)
  dataEnvio     DateTime? @map("data_envio")
  createdAt     DateTime  @default(now()) @map("data_criacao")

  cidadao     Cidadao      @relation(fields: [cidadaoId], references: [id])
  agendamento Agendamento? @relation(fields: [agendamentoId], references: [id])

  @@map("notificacao")
}

model LogAuditoria {
  id              String   @id @default(cuid())
  usuarioId       String?  @map("id_usuario")
  acao            String
  tabelaAfetada   String?  @map("tabela_afetada")
  registroId      String?  @map("registro_id")
  dadosAnteriores String?  @map("dados_anteriores")
  dadosNovos      String?  @map("dados_novos")
  ipOrigem        String?  @map("ip_origem")
  createdAt       DateTime @default(now()) @map("data_registro")

  usuario Usuario? @relation(fields: [usuarioId], references: [id])

  @@map("log_auditoria")
}
```

- [ ] **Step 2: Regenerar o Prisma Client**

```bash
npx prisma generate
```

Esperado: `✔ Generated Prisma Client` sem erros.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: migrate Prisma schema from MongoDB to PostgreSQL"
```

---

## Task 3: Criar tabelas no Neon

**Files:**
- Create: `prisma/migrations/` (gerado automaticamente)

- [ ] **Step 1: Executar a migration inicial**

```bash
npx prisma migrate dev --name init
```

Esperado: Prisma cria todas as tabelas no Neon e confirma com:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

Se pedir confirmação de reset de banco vazio, responda `y`.

- [ ] **Step 2: Verificar tabelas criadas**

```bash
npx prisma studio
```

Abrir `http://localhost:5555` e confirmar que as 11 tabelas aparecem na lista (secretaria, unidade_atendimento, servico, cidadao, perfil_acesso, usuario, agenda, agendamento, atendimento, notificacao, log_auditoria).

Fechar Prisma Studio (Ctrl+C) antes de continuar.

- [ ] **Step 3: Commit**

```bash
git add prisma/migrations/
git commit -m "feat: add initial PostgreSQL migration"
```

---

## Task 4: Adicionar script db:migrate no `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Adicionar o script**

No `package.json`, dentro de `"scripts"`, adicionar após `"db:seed"`:

```json
"db:migrate": "npx prisma migrate dev"
```

O bloco `scripts` final deve ficar:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:generate": "npx prisma generate",
  "db:push": "npx prisma db push",
  "db:seed": "npx tsx prisma/seed.ts",
  "db:migrate": "npx prisma migrate dev"
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add db:migrate script to package.json"
```

---

## Task 5: Criar script de migração de dados

**Files:**
- Create: `prisma/migrate-mongo-to-pg.ts`

- [ ] **Step 1: Criar o arquivo**

Criar `prisma/migrate-mongo-to-pg.ts` com o seguinte conteúdo:

```typescript
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
```

- [ ] **Step 2: Executar o script de migração**

```bash
npx tsx prisma/migrate-mongo-to-pg.ts
```

Esperado — cada linha deve aparecer sem erros:
```
Conectado ao MongoDB. Iniciando migração...

✔ perfil_acesso: N registros
✔ secretaria: N registros
✔ unidade_atendimento: N registros
✔ servico: N registros
✔ cidadao: N registros
✔ usuario: N registros
✔ agenda: N registros
✔ agendamento: N registros
✔ atendimento: N registros
✔ notificacao: N registros
✔ log_auditoria: N registros

✅ Migração concluída com sucesso!
```

Se aparecer erro `ID não mapeado`, significa que um documento do Mongo referencia um ID que não existe na collection pai. Verifique o ID no MongoDB Compass.

- [ ] **Step 3: Verificar dados no Neon via Prisma Studio**

```bash
npx prisma studio
```

Abrir `http://localhost:5555`, clicar em algumas tabelas e confirmar que os dados foram migrados corretamente. Fechar com Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add prisma/migrate-mongo-to-pg.ts
git commit -m "feat: add MongoDB to PostgreSQL data migration script"
```

---

## Task 6: Verificar que a aplicação funciona

**Files:** nenhum arquivo novo

- [ ] **Step 1: Subir o servidor de desenvolvimento**

```bash
npm run dev
```

Esperado: servidor em `http://localhost:3000` sem erros no terminal.

- [ ] **Step 2: Testar o portal do cidadão**

Abrir `http://localhost:3000` no navegador e confirmar:
- A lista de secretarias/serviços carrega
- É possível fazer login com `CPF: 12345678901` e `Senha: senha123`
- A página "Meus Agendamentos" mostra os agendamentos migrados

- [ ] **Step 3: Testar o painel admin**

Abrir `http://localhost:3000/painel/login` e fazer login com:
- CPF: `98765432100`
- Senha: `admin123!`

Confirmar que o painel carrega com os dados do Neon.

---

## Task 7: Limpeza final

**Files:**
- Modify: `package.json`
- Modify: `.env`

- [ ] **Step 1: Remover o pacote mongodb**

```bash
npm uninstall mongodb
```

Esperado: `mongodb` removido de `dependencies` no `package.json`.

- [ ] **Step 2: Remover MONGODB_URL do .env**

No `.env`, remover a linha:
```
MONGODB_URL="mongodb+srv://..."
```

- [ ] **Step 3: Commit final**

```bash
git add package.json .env
git commit -m "chore: remove MongoDB dependency after successful migration"
```
