"use client"

import { AlertTriangle } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-lg font-semibold">Algo deu errado</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-light"
        >
          Tentar novamente
        </button>
      </div>
    </PageContainer>
  )
}
