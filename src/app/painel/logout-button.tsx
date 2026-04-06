"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function PainelLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/painel/login" })}
      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sair
    </button>
  )
}
