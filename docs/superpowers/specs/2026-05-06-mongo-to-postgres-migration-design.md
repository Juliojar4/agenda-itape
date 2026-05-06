# Design: Migração MongoDB → PostgreSQL (Neon)

**Data:** 2026-05-06  
**Status:** Aprovado

---

## Contexto

O projeto usa Prisma como ORM com MongoDB como provider. A migração para PostgreSQL (Neon) melhora a consistência de dados (transações ACID reais), facilita queries relacionais e é mais adequada para o modelo relacional já definido no schema.

---

## Arquitetura

O Prisma abstrai o banco — a lógica da aplicação (`src/app/api/**`) não muda. Apenas o `schema.prisma`, o `.env`, e as dependências precisam ser atualizados.

---

## Mudanças no Schema (`prisma/schema.prisma`)

- `datasource db.provider`: `"mongodb"` → `"postgresql"`
- `datasource db.url`: aponta para `DATABASE_URL` (Neon)
- Todos os IDs: `@id @default(auto()) @map("_id") @db.ObjectId` → `@id @default(cuid())`
- Todas as foreign keys: remover `@db.ObjectId` (manter `@map` onde os nomes diferem)
- Adicionar `directUrl = env("DATABASE_URL_UNPOOLED")` para compatibilidade com Neon (pooled vs direct)

---

## Script de Migração de Dados (`prisma/migrate-mongo-to-pg.ts`)

Script único executado manualmente via `npx tsx prisma/migrate-mongo-to-pg.ts`.

**Fluxo:**
1. Conecta no MongoDB via `mongodb` package usando `MONGODB_URL` env var
2. Conecta no PostgreSQL via Prisma Client
3. Processa collections em ordem topológica (sem FK primeiro, dependentes depois):
   - `PerfilAcesso` → `Secretaria` → `UnidadeAtendimento` → `Servico` → `Cidadao` → `Usuario` → `Agenda` → `Agendamento` → `Atendimento` → `Notificacao` → `LogAuditoria`
4. Para cada registro: mapeia `_id` (ObjectId string) para um novo `cuid()`, mantendo um dicionário `Map<string, string>` (oldId → newId) por collection
5. Ao inserir registros com FK, resolve o novo ID a partir do dicionário
6. Ao final imprime contagem de registros migrados por collection

**Tratamento de erros:** se qualquer collection falhar, o script para e exibe o erro com contexto do registro problemático.

---

## Variáveis de Ambiente (`.env`)

```
# Remover ou comentar:
# DATABASE_URL=mongodb+srv://...

# Adicionar:
DATABASE_URL=postgresql://neondb_owner:...@ep-old-snow-acxkg0mf.sa-east-1.aws.neon.tech/neondb?sslmode=require
MONGODB_URL=<connection string antiga do Mongo — apenas para rodar o script de migração>
```

---

## `package.json`

- Adicionar script: `"db:migrate": "npx prisma migrate dev"`
- Remover pacote `mongodb` após confirmação da migração bem-sucedida

---

## `seed.ts`

Não precisa de alterações — usa apenas Prisma Client, sem sintaxe MongoDB-específica.

---

## Ordem de Execução

1. Atualizar `schema.prisma`
2. Configurar `.env` com `DATABASE_URL` (Neon) e `MONGODB_URL` (Mongo antigo)
3. `npx prisma migrate dev --name init` — cria tabelas no Neon
4. `npx tsx prisma/migrate-mongo-to-pg.ts` — migra os dados
5. Verificar dados no Neon dashboard
6. Remover `mongodb` das dependências
7. Remover `MONGODB_URL` do `.env`

---

## O que NÃO muda

- Toda a lógica de API (`src/app/api/**`)
- `src/lib/prisma.ts`
- `prisma/seed.ts`
- Componentes React, hooks, providers
