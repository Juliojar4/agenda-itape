"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { cadastroCidadaoSchema, type CadastroCidadaoInput } from "@/lib/validators"
import { formatCPF, formatPhone } from "@/lib/utils"

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CadastroCidadaoInput>({
    resolver: zodResolver(cadastroCidadaoSchema),
    defaultValues: {
      aceiteLgpd: false as unknown as true,
    },
  })

  async function onSubmit(data: CadastroCidadaoInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/cidadao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao cadastrar")
        return
      }

      toast.success("Cadastro realizado com sucesso!")

      // Auto-login
      await signIn("credentials", {
        cpf: data.cpf,
        senha: data.senha,
        redirect: false,
      })

      router.push("/")
      router.refresh()
    } catch {
      toast.error("Erro ao cadastrar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
      <h2 className="mb-1 text-lg font-bold text-card-foreground">
        Criar conta
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Preencha seus dados para se cadastrar
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome completo</label>
          <input
            {...register("nome")}
            type="text"
            placeholder="Seu nome completo"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.nome && (
            <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">CPF</label>
          <input
            {...register("cpf")}
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => {
              const formatted = formatCPF(e.target.value)
              e.target.value = formatted
              setValue("cpf", formatted)
            }}
            maxLength={14}
          />
          {errors.cpf && (
            <p className="mt-1 text-xs text-destructive">{errors.cpf.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Data nascimento
            </label>
            <input
              {...register("dataNascimento")}
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.dataNascimento && (
              <p className="mt-1 text-xs text-destructive">
                {errors.dataNascimento.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sexo</label>
            <select
              {...register("sexo")}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
            {errors.sexo && (
              <p className="mt-1 text-xs text-destructive">
                {errors.sexo.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Telefone (opcional)
          </label>
          <input
            {...register("telefone")}
            type="text"
            inputMode="numeric"
            placeholder="(15) 99999-9999"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => {
              const formatted = formatPhone(e.target.value)
              e.target.value = formatted
              setValue("telefone", formatted)
            }}
            maxLength={15}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email (opcional)
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="seu@email.com"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Senha</label>
          <div className="relative">
            <input
              {...register("senha")}
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 caracteres com letra, numero e especial"
              className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.senha && (
            <p className="mt-1 text-xs text-destructive">
              {errors.senha.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            {...register("aceiteLgpd")}
            type="checkbox"
            id="lgpd"
            className="mt-0.5 h-4 w-4 rounded border accent-primary"
          />
          <label htmlFor="lgpd" className="text-xs text-muted-foreground">
            Concordo com o tratamento dos meus dados pessoais conforme a Lei
            Geral de Protecao de Dados (LGPD)
          </label>
        </div>
        {errors.aceiteLgpd && (
          <p className="text-xs text-destructive">{errors.aceiteLgpd.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "Cadastrando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Ja tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
