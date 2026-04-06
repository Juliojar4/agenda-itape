import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

declare module "next-auth" {
  interface User {
    cpf?: string
    role?: "CIDADAO" | "FUNCIONARIO"
    perfilNome?: string
    unidadeId?: string
  }
  interface Session {
    user: {
      id: string
      cpf?: string
      role?: "CIDADAO" | "FUNCIONARIO"
      perfilNome?: string
      unidadeId?: string
    } & DefaultSession["user"]
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "CPF",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.senha) return null

        const cpf = (credentials.cpf as string).replace(/\D/g, "")
        const senha = credentials.senha as string

        // Try Cidadao first
        const cidadao = await prisma.cidadao.findUnique({ where: { cpf } })
        if (cidadao && cidadao.ativo) {
          const senhaValida = await bcrypt.compare(senha, cidadao.senhaHash)
          if (senhaValida) {
            return {
              id: String(cidadao.id),
              name: cidadao.nome,
              email: cidadao.email ?? undefined,
              cpf: cidadao.cpf,
              role: "CIDADAO" as const,
            }
          }
        }

        // Try Usuario (staff)
        const usuario = await prisma.usuario.findUnique({
          where: { cpf },
          include: { perfil: true },
        })

        if (!usuario || !usuario.ativo) return null

        if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) return null

        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash)
        if (!senhaValida) {
          const novasTentativas = usuario.tentativasLogin + 1
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              tentativasLogin: novasTentativas,
              bloqueadoAte:
                novasTentativas >= 5
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : null,
            },
          })
          return null
        }

        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { tentativasLogin: 0, bloqueadoAte: null },
        })

        return {
          id: String(usuario.id),
          name: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          role: "FUNCIONARIO" as const,
          perfilNome: usuario.perfil.nome,
          unidadeId: usuario.unidadeId ? String(usuario.unidadeId) : undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.cpf = user.cpf
        token.role = user.role
        token.perfilNome = user.perfilNome
        token.unidadeId = user.unidadeId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.cpf = token.cpf as string | undefined
        session.user.role = token.role as "CIDADAO" | "FUNCIONARIO" | undefined
        session.user.perfilNome = token.perfilNome as string | undefined
        session.user.unidadeId = token.unidadeId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
