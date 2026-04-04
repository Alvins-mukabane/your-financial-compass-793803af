import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePublicUser } from "@/context/PublicUserContext";
import evaAppIcon from "@/assets/eva-app-icon.png";
import evaLockup from "@/assets/eva-lockup.png";

function readLastEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("eva-last-email") ?? "";
}

export default function Auth() {
  const { signInWithMagicLink } = usePublicUser();
  const [email, setEmail] = useState(() => readLastEmail());
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const helperText = useMemo(() => {
    if (!sentTo) {
      return "Use your email to sign in securely. eva will open your workspace after you confirm the magic link.";
    }

    return `A sign-in link was sent to ${sentTo}. Open the email on this device to continue into your workspace.`;
  }, [sentTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Enter your email to continue.");
      return;
    }

    setSending(true);
    try {
      await signInWithMagicLink(trimmed);
      setSentTo(trimmed);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("eva-last-email", trimmed);
      }
      toast.success("Magic link sent. Check your inbox.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send the magic link right now.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col justify-center gap-8 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <img src={evaAppIcon} alt="eva app icon" className="h-8 w-8 rounded-2xl" />
            Back to eva home
          </Link>

          <div className="space-y-4">
            <img src={evaLockup} alt="eva" className="h-16 w-auto object-contain" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Secure workspace access
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Sign in to unlock your real eva finance workspace.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              This is the foundation for cross-device sync, a canonical finance record, and the
              future agent workflows you want to build on top of eva.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/85 p-4">
              One account
              <p className="mt-1 text-xs leading-relaxed">
                Your data follows you across devices instead of staying trapped in one browser.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/85 p-4">
              Canonical records
              <p className="mt-1 text-xs leading-relaxed">
                Chat, history, insights, and statements now read from the same source of truth.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/85 p-4">
              Agent-ready
              <p className="mt-1 text-xs leading-relaxed">
                Authentication is the base layer for approvals, execution limits, and future automation.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-[0_28px_80px_-54px_rgba(110,73,75,0.32)] md:p-8"
        >
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Magic link sign in
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Continue with email
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{helperText}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Email address</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 pl-11 text-base"
                />
              </div>
            </label>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
              {sending ? "Sending magic link..." : "Send magic link"}
              {!sending && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            By continuing, you will use Supabase Auth email magic links for secure sign-in. Your
            previous anonymous workspace will be imported automatically when available.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
