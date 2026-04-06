"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

interface CancelDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (motivo: string) => void
  loading?: boolean
}

export function CancelDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: CancelDialogProps) {
  const [motivo, setMotivo] = useState("")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Cancelar agendamento</h3>
            <p className="text-sm text-muted-foreground">
              Esta acao nao pode ser desfeita
            </p>
          </div>
        </div>

        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo do cancelamento (opcional)"
          className="mb-4 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          maxLength={500}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Voltar
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            disabled={loading}
            className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            {loading ? "Cancelando..." : "Confirmar cancelamento"}
          </button>
        </div>
      </div>
    </div>
  )
}
