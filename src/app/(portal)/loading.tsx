import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </PageContainer>
  )
}
