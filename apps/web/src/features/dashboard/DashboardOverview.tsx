import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardOverview({
  firstName,
  nextAction,
  onOpenNextAction,
}: {
  firstName?: string | null;
  nextAction: {
    title: string;
    body: string;
    ctaLabel: string;
  };
  onOpenNextAction: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      data-testid="dashboard-overview"
      className="rounded-[1.9rem] border border-border/80 bg-card/95 p-5 shadow-[0_24px_70px_-44px_rgba(110,73,75,0.28)] md:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            EVA workspace
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
              {firstName ? `Welcome back, ${firstName}` : "Your financial overview"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              This workspace stays grounded in your onboarding baseline, approved spending
              history, and the next action EVA thinks deserves attention now, not guesswork or
              mock insight.
            </p>
          </div>
        </div>

        <div
          data-testid="dashboard-next-action"
          className="rounded-[1.4rem] border border-primary/15 bg-primary/8 p-4 lg:max-w-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Next recommendation
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{nextAction.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{nextAction.body}</p>
          <Button type="button" className="mt-4 gap-2" onClick={onOpenNextAction}>
            {nextAction.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
