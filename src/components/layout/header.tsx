import { APP_NAME, CITY_NAME } from "@/constants"

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">{APP_NAME}</span>
          <span className="text-[10px] leading-tight opacity-80">
            {CITY_NAME}
          </span>
        </div>
      </div>
    </header>
  )
}
