import Link from "next/link"
import { Clock, MapPin, FileText } from "lucide-react"
import type { ServicoComSecretaria } from "@/types"

interface ServiceCardProps {
  servico: ServicoComSecretaria
}

export function ServiceCard({ servico }: ServiceCardProps) {
  return (
    <Link href={`/agendar/${servico.id}`}>
      <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-none">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {servico.secretaria.icone} {servico.secretaria.sigla}
            </span>
            <h3 className="font-semibold text-card-foreground">
              {servico.nome}
            </h3>
          </div>
        </div>
        {servico.descricao && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {servico.descricao}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {servico.tempoMedioMinutos} min
          </span>
          {servico.documentosNecessarios && (
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              Documentos necessarios
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
