import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = (req.auth?.user as { role?: string } | undefined)?.role

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/cadastro")
  const isPainelLogin = pathname === "/painel/login"
  const isPainel = pathname.startsWith("/painel")
  const isApiAuth = pathname.startsWith("/api/auth")
  const isApiCidadao = pathname === "/api/cidadao"
  const isPublicApi = isApiAuth || isApiCidadao
  const isApiPainel = pathname.startsWith("/api/painel/")

  // Painel login page
  if (isPainelLogin) {
    if (isLoggedIn && role === "FUNCIONARIO") {
      return NextResponse.redirect(new URL("/painel", req.url))
    }
    return NextResponse.next()
  }

  // Painel routes (except login) require FUNCIONARIO role
  if (isPainel) {
    if (!isLoggedIn || role !== "FUNCIONARIO") {
      return NextResponse.redirect(new URL("/painel/login", req.url))
    }
    return NextResponse.next()
  }

  // API painel routes require FUNCIONARIO role
  if (isApiPainel) {
    if (!isLoggedIn || role !== "FUNCIONARIO") {
      return Response.json({ error: "Nao autorizado" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Citizen auth pages
  if (isAuthPage) {
    if (isLoggedIn && role === "CIDADAO") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  if (isPublicApi) {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Nao autorizado" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
