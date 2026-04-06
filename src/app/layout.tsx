import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Toaster } from "sonner"
import { SessionProvider } from "@/providers/session-provider"
import { QueryProvider } from "@/providers/query-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "AgendaFacil - Prefeitura de Itapetininga",
    template: "%s | AgendaFacil",
  },
  description:
    "Sistema de agendamento de servicos publicos da Prefeitura de Itapetininga/SP",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D47A1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
