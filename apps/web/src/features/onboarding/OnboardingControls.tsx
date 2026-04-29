import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SelectionCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon?: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.35rem] border p-4 text-left transition-all duration-200 ${
        active
          ? "border-primary/35 bg-primary/8 shadow-[0_18px_48px_-36px_rgba(110,73,75,0.3)]"
          : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function StepBackButton({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button type="button" variant="ghost" className="gap-2 px-2" onClick={onClick}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
