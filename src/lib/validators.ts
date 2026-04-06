import { z } from "zod"
import { validateCPF } from "./utils"

export const loginSchema = z.object({
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(11, "CPF deve ter 11 digitos")),
  senha: z.string().min(4, "Senha deve ter no minimo 4 caracteres"),
})

export const cadastroCidadaoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres").max(200),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(
      z.string().length(11, "CPF deve ter 11 digitos").refine(validateCPF, "CPF invalido")
    ),
  dataNascimento: z.string().min(1, "Data de nascimento obrigatoria"),
  sexo: z.enum(["M", "F", "O"], { message: "Sexo obrigatorio" }),
  telefone: z
    .string()
    .optional()
    .transform((v) => v?.replace(/\D/g, "") || undefined),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  senha: z
    .string()
    .min(8, "Senha deve ter no minimo 8 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter letras")
    .regex(/[0-9]/, "Senha deve conter numeros")
    .regex(/[^a-zA-Z0-9]/, "Senha deve conter caractere especial"),
  aceiteLgpd: z.literal(true, {
    message: "Voce deve aceitar os termos da LGPD",
  }),
})

export const criarAgendamentoSchema = z.object({
  agendaId: z.number().int().positive(),
  servicoId: z.number().int().positive(),
  unidadeId: z.number().int().positive(),
})

export const cancelarAgendamentoSchema = z.object({
  motivoCancelamento: z.string().max(500).optional(),
})

export type LoginInput = z.input<typeof loginSchema>
export type CadastroCidadaoInput = z.input<typeof cadastroCidadaoSchema>
export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>
export type CancelarAgendamentoInput = z.infer<typeof cancelarAgendamentoSchema>
