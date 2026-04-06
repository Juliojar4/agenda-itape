"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogIn, Eye, EyeOff, Building2 } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginInput } from "@/lib/validators"
import { formatCPF } from "@/lib/utils"
import { CITY_NAME } from "@/constants"

export default function PainelLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        cpf: data.cpf,
        senha: data.senha,
        redirect: false,
      })

      if (result?.error) {
        toast.error("CPF ou senha invalidos")
      } else {
        router.push("/painel")
        router.refresh()
      }
    } catch {
      toast.error("Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">{CITY_NAME}</p>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-xl">
          <h2 className="mb-1 text-base font-semibold text-card-foreground">
            Acesso Restrito
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Exclusivo para funcionarios municipais
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div>
              <label className="mb-1 block text-sm font-medium">Senha</label>
              <div className="relative">
                <input
                  {...register("senha")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
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
                <p className="mt-1 text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Entrando..." : "Entrar no Painel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
