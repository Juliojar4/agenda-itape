import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard, CalendarCheck, CalendarPlus, LogOut, Building2 } from "lucide-react"
import { CITY_NAME } from "@/constants"
import { PainelLogoutButton } from "./logout-button"

const navItems = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/painel/agendamentos", label: "Agendamentos", icon: CalendarCheck },
  { href: "/painel/agenda", label: "Gerir Agenda", icon: CalendarPlus },
]

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "FUNCIONARIO") {
    redirect("/painel/login")
  }

  const perfilNome = (session.user as { perfilNome?: string }).perfilNome

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-card-foreground">
              Painel Admin
            </p>
            <p className="text-[10px] text-muted-foreground">{CITY_NAME}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-card-foreground">{session.user.name}</p>
            <p className="text-[10px] text-muted-foreground">{perfilNome}</p>
          </div>
          <PainelLogoutButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-52 shrink-0 border-r bg-card pt-4 sm:block">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 pb-24 sm:p-6 sm:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t bg-card shadow-lg sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-muted-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
