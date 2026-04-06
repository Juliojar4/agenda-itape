"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CalendarPlus, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/servicos", label: "Agendar", icon: CalendarPlus },
  { href: "/meus-agendamentos", label: "Agendamentos", icon: ClipboardList },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-primary")}
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
