import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  ArrowLeftRight,
  Target,
  FileText,
  Settings,
  Menu,
  BarChart3,
  Newspaper,
  CreditCard,
  DollarSign,
  History,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

const primaryMenuItems: NavItem[] = [
  { path: "/chat", label: "AI Advisor", icon: MessageSquare },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/spending-history", label: "Spending History", icon: History },
  { path: "/budget", label: "Budget Limits", icon: DollarSign },
  { path: "/goals", label: "Goals", icon: Target },
];

const utilityMenuItems: NavItem[] = [
  { path: "/financial-statement", label: "Financial Statement", icon: FileText },
  { path: "/insights", label: "Spending Insights", icon: BarChart3 },
  { path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { path: "/news", label: "Finance News", icon: Newspaper },
  { path: "/stock-picks", label: "Stock Picks", icon: TrendingUp },
];

const supportMenuItems: NavItem[] = [
  { path: "/settings", label: "Settings", icon: Settings },
];

const mobileTabs: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/chat", label: "Advisor", icon: MessageSquare },
  { path: "/budget", label: "Budget", icon: DollarSign },
  { path: "/settings", label: "Settings", icon: Settings },
];

const mobileMoreSections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/chat", label: "AI Advisor", icon: MessageSquare },
      { path: "/budget", label: "Budget Limits", icon: DollarSign },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Track",
    items: [
      { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
      { path: "/spending-history", label: "Spending History", icon: History },
      { path: "/goals", label: "Goals", icon: Target },
      { path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "Insights",
    items: [
      { path: "/financial-statement", label: "Financial Statement", icon: FileText },
      { path: "/insights", label: "Spending Insights", icon: BarChart3 },
      { path: "/news", label: "Finance News", icon: Newspaper },
      { path: "/stock-picks", label: "Stock Picks", icon: TrendingUp },
    ],
  },
];

function SidebarButton({
  item,
  activePath,
  onClick,
}: {
  item: NavItem;
  activePath: string;
  onClick: () => void;
}) {
  const isActive = activePath === item.path;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-base font-medium transition-colors",
        isActive
          ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(243,162,28,0.14)]"
          : "text-muted-foreground hover:bg-secondary/90 hover:text-foreground",
      )}
    >
      <item.icon className="h-[18px] w-[18px]" />
      {item.label}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mobileMoreItems = mobileMoreSections.flatMap((section) => section.items);
  const isMoreActive = mobileMoreItems.some((item) => item.path === activePath);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [activePath]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="window-controls-safe-sidebar fixed hidden w-[236px] flex-col gap-4 border-r border-border/90 bg-[hsl(var(--sidebar-background)/0.94)] p-4 pt-5 shadow-[18px_0_45px_-38px_rgba(110,73,75,0.28)] backdrop-blur-xl md:flex">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <nav className="space-y-2 pb-2">
            <div className="space-y-1 rounded-[1.5rem] border border-border/80 bg-card/90 p-2 shadow-[0_18px_40px_-34px_rgba(110,73,75,0.18)]">
              <SidebarButton
                item={{ path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }}
                activePath={activePath}
                onClick={() => navigate("/dashboard")}
              />
              {primaryMenuItems.map((item) => (
                <SidebarButton key={item.path} item={item} activePath={activePath} onClick={() => navigate(item.path)} />
              ))}
              {utilityMenuItems.map((item) => (
                <SidebarButton key={item.path} item={item} activePath={activePath} onClick={() => navigate(item.path)} />
              ))}
            </div>
          </nav>
        </div>

        <div className="space-y-1 border-t border-border/80 pt-3">
          {supportMenuItems.map((item) => (
            <SidebarButton key={item.path} item={item} activePath={activePath} onClick={() => navigate(item.path)} />
          ))}
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/90 bg-[hsl(var(--background)/0.94)] shadow-[0_16px_32px_-28px_rgba(110,73,75,0.25)] backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <BrandLockup
              size="sm"
              subtitleClassName="text-[0.56rem] tracking-[0.2em]"
              titleClassName="text-[1.05rem]"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Back to home"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="window-controls-safe-main flex-1 pb-20 pt-16 md:ml-[236px] md:pt-0 md:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 shadow-[0_-16px_32px_-28px_rgba(110,73,75,0.22)] backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {mobileTabs.map((tab) => {
            const isActive = activePath === tab.path;
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-active"
                    className="absolute left-1/2 top-0 h-[2px] w-5 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors",
              isMoreOpen || isMoreActive ? "text-primary" : "text-muted-foreground",
            )}
            aria-expanded={isMoreOpen}
            aria-label="Open more navigation"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
            {(isMoreOpen || isMoreActive) && (
              <motion.div
                layoutId="tab-active"
                className="absolute left-1/2 top-0 h-[2px] w-5 -translate-x-1/2 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close more menu"
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-3 bottom-[4.5rem] top-[5.1rem] z-50 flex flex-col rounded-[1.9rem] border border-border bg-card/98 p-4 shadow-[0_30px_70px_-40px_rgba(110,73,75,0.34)] md:hidden"
            >
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/75 pb-4">
                <div className="flex items-center gap-3">
                  <BrandLockup size="sm" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close more menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
                {mobileMoreSections.map((section) => (
                  <div key={section.label} className="space-y-2">
                    <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{section.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={cn(
                              "flex min-h-[4.75rem] items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition-colors",
                              isActive
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border bg-background text-foreground hover:border-primary/20 hover:bg-secondary",
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="leading-tight">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
