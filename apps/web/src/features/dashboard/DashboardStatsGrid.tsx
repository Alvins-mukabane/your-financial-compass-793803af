import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function DashboardStatsGrid({
  stats,
  fadeUp,
}: {
  stats: Array<{ label: string; value: string; icon: LucideIcon }>;
  fadeUp: {
    hidden: { opacity: number; y: number; filter: string };
    visible: (index: number) => {
      opacity: number;
      y: number;
      filter: string;
      transition: {
        delay: number;
        duration: number;
        ease: [number, number, number, number];
      };
    };
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          data-testid={`dashboard-stat-${stat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          className="space-y-3 rounded-[1.35rem] border border-border/80 bg-card/95 p-4 shadow-[0_18px_48px_-38px_rgba(110,73,75,0.2)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {stat.label}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
