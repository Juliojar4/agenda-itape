import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  )
}
