export const APP_NAME = "AgendaFacil Municipal"
export const CITY_NAME = "Prefeitura de Itapetininga"

export const STATUS_LABELS: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  REALIZADO: "Realizado",
  NAO_COMPARECEU: "Nao Compareceu",
  CANCELADO_CIDADAO: "Cancelado",
  CANCELADO_PREFEITURA: "Cancelado pela Prefeitura",
}

export const STATUS_COLORS: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-800",
  CONFIRMADO: "bg-cyan-100 text-cyan-800",
  REALIZADO: "bg-green-100 text-green-800",
  NAO_COMPARECEU: "bg-orange-100 text-orange-800",
  CANCELADO_CIDADAO: "bg-red-100 text-red-800",
  CANCELADO_PREFEITURA: "bg-red-100 text-red-800",
}

export const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "Home" as const },
  { href: "/servicos", label: "Agendar", icon: "CalendarPlus" as const },
  { href: "/meus-agendamentos", label: "Agendamentos", icon: "ClipboardList" as const },
]
