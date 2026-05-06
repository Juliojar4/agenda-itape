-- CreateTable
CREATE TABLE "secretaria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "icone" TEXT NOT NULL DEFAULT '🏛️',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secretaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidade_atendimento" (
    "id" TEXT NOT NULL,
    "id_secretaria" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cep" TEXT,
    "telefone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidade_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servico" (
    "id" TEXT NOT NULL,
    "id_secretaria" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tempo_medio_minutos" INTEGER NOT NULL DEFAULT 30,
    "documentos_necessarios" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidadao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "endereco" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "senha_hash" TEXT NOT NULL,
    "aceite_lgpd" BOOLEAN NOT NULL DEFAULT false,
    "aceite_notificacoes" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cidadao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_acesso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "perfil_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "id_perfil" TEXT NOT NULL,
    "id_secretaria" TEXT,
    "id_unidade" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tentativas_login" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_ate" TIMESTAMP(3),
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda" (
    "id" TEXT NOT NULL,
    "id_servico" TEXT NOT NULL,
    "id_unidade" TEXT NOT NULL,
    "data_disponivel" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fim" TIMESTAMP(3) NOT NULL,
    "vagas_total" INTEGER NOT NULL DEFAULT 1,
    "vagas_disponiveis" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento" (
    "id" TEXT NOT NULL,
    "id_cidadao" TEXT NOT NULL,
    "id_agenda" TEXT NOT NULL,
    "id_servico" TEXT NOT NULL,
    "id_unidade" TEXT NOT NULL,
    "data_agendamento" TIMESTAMP(3) NOT NULL,
    "hora_agendamento" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGENDADO',
    "motivo_cancelamento" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimento" (
    "id" TEXT NOT NULL,
    "id_agendamento" TEXT NOT NULL,
    "id_usuario_atendente" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tempo_efetivo_minutos" INTEGER,
    "observacoes" TEXT,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacao" (
    "id" TEXT NOT NULL,
    "id_cidadao" TEXT NOT NULL,
    "id_agendamento" TEXT,
    "tipo" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'EMAIL',
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "enviada" BOOLEAN NOT NULL DEFAULT false,
    "data_envio" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id" TEXT NOT NULL,
    "id_usuario" TEXT,
    "acao" TEXT NOT NULL,
    "tabela_afetada" TEXT,
    "registro_id" TEXT,
    "dados_anteriores" TEXT,
    "dados_novos" TEXT,
    "ip_origem" TEXT,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cidadao_cpf_key" ON "cidadao"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_acesso_nome_key" ON "perfil_acesso"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cpf_key" ON "usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "atendimento_id_agendamento_key" ON "atendimento"("id_agendamento");

-- AddForeignKey
ALTER TABLE "unidade_atendimento" ADD CONSTRAINT "unidade_atendimento_id_secretaria_fkey" FOREIGN KEY ("id_secretaria") REFERENCES "secretaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servico" ADD CONSTRAINT "servico_id_secretaria_fkey" FOREIGN KEY ("id_secretaria") REFERENCES "secretaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_perfil_fkey" FOREIGN KEY ("id_perfil") REFERENCES "perfil_acesso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_secretaria_fkey" FOREIGN KEY ("id_secretaria") REFERENCES "secretaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_unidade_fkey" FOREIGN KEY ("id_unidade") REFERENCES "unidade_atendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_id_unidade_fkey" FOREIGN KEY ("id_unidade") REFERENCES "unidade_atendimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_cidadao_fkey" FOREIGN KEY ("id_cidadao") REFERENCES "cidadao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_agenda_fkey" FOREIGN KEY ("id_agenda") REFERENCES "agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento" ADD CONSTRAINT "agendamento_id_unidade_fkey" FOREIGN KEY ("id_unidade") REFERENCES "unidade_atendimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento" ADD CONSTRAINT "atendimento_id_usuario_atendente_fkey" FOREIGN KEY ("id_usuario_atendente") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_cidadao_fkey" FOREIGN KEY ("id_cidadao") REFERENCES "cidadao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "log_auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
