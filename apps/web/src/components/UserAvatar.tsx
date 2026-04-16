import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createUserAvatarSrc, getAvatarInitials } from "@/lib/userAvatar";

type UserAvatarProps = {
  seed: string;
  name: string;
  email?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export default function UserAvatar({
  seed,
  name,
  email,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const avatarSrc = createUserAvatarSrc(seed, name, email);
  const initials = getAvatarInitials(name, email);

  return (
    <Avatar className={cn("h-10 w-10 border border-border/80 shadow-sm", className)}>
      <AvatarImage src={avatarSrc} alt={`${name || "eva"} avatar`} />
      <AvatarFallback className={cn("bg-secondary text-foreground", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
