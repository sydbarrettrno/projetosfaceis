import { Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">Projeto Fácil</span>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Descomplicando Projetos
            </span>
          </span>
        </Link>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Casa Residencial Unifamiliar
        </span>
      </div>
    </header>
  );
}
