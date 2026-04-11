import { cn } from "@/lib/utils";

type BrandLockupProps = {
  align?: "left" | "center";
  className?: string;
  fetchPriority?: "auto" | "high" | "low";
  iconClassName?: string;
  loading?: "eager" | "lazy";
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  subtitleClassName?: string;
  titleClassName?: string;
};

const sizeStyles = {
  sm: {
    wrapper: "gap-3",
    icon: "h-10 w-10 rounded-[1.05rem]",
    title: "text-lg",
    subtitle: "text-[0.66rem] tracking-[0.22em]",
  },
  md: {
    wrapper: "gap-4",
    icon: "h-14 w-14 rounded-[1.35rem]",
    title: "text-[1.7rem]",
    subtitle: "text-[0.72rem] tracking-[0.24em]",
  },
  lg: {
    wrapper: "gap-5",
    icon: "h-20 w-20 rounded-[1.8rem]",
    title: "text-[2.6rem]",
    subtitle: "text-[0.78rem] tracking-[0.28em]",
  },
} as const;

export default function BrandLockup({
  align = "left",
  className,
  fetchPriority = "auto",
  iconClassName,
  loading = "lazy",
  size = "md",
  subtitle = "Your AI Finance Assistant",
  subtitleClassName,
  titleClassName,
}: BrandLockupProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex items-center",
        styles.wrapper,
        align === "center" ? "justify-center text-center" : "justify-start text-left",
        className,
      )}
    >
      <img
        src="/apple-touch-icon.png"
        alt="eva app icon"
        width={192}
        height={192}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={cn(
          "object-cover shadow-[0_22px_44px_-28px_rgba(110,73,75,0.34)]",
          styles.icon,
          iconClassName,
        )}
      />
      <div className="space-y-1">
        <p className={cn("font-black lowercase leading-none text-foreground", styles.title, titleClassName)}>
          eva
        </p>
        <p
          className={cn(
            "font-semibold uppercase leading-none text-muted-foreground",
            styles.subtitle,
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
