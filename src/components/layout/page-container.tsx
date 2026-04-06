import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main className={cn("mx-auto w-full max-w-lg px-4 pb-20 pt-4", className)}>
      {children}
    </main>
  )
}
