import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acesso | AgendaFacil",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          AgendaFacil
        </h1>
        <p className="text-sm text-primary-foreground/80">
          Prefeitura de Itapetininga
        </p>
      </div>
      {children}
      <p className="mt-6 text-center text-xs text-primary-foreground/60">
        Sistema protegido pela LGPD
      </p>
    </div>
  )
}
