import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePublicUser } from "@/context/PublicUserContext";
import {
  SENSITIVE_ACTIONS,
  type SensitiveActionId,
} from "@/lib/sensitiveActions";
import type { SensitiveActionCodeRequest } from "@/lib/evaContracts";

type SensitiveActionDialogProps = {
  action: SensitiveActionId;
  onOpenChange: (open: boolean) => void;
  onVerified: (verificationId: string) => Promise<void> | void;
  open: boolean;
};

function getRemainingSeconds(request: SensitiveActionCodeRequest | null) {
  if (!request) return 0;
  const remainingMs = new Date(request.resend_available_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export default function SensitiveActionDialog({
  action,
  onOpenChange,
  onVerified,
  open,
}: SensitiveActionDialogProps) {
  const { requestSensitiveActionCode, verifySensitiveActionCode } = usePublicUser();
  const meta = SENSITIVE_ACTIONS[action];
  const [code, setCode] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [request, setRequest] = useState<SensitiveActionCodeRequest | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [hasAutoRequested, setHasAutoRequested] = useState(false);

  useEffect(() => {
    if (!open) {
      setCode("");
      setRequest(null);
      setCooldown(0);
      setRequesting(false);
      setVerifying(false);
      setHasAutoRequested(false);
      return;
    }

    if (request || requesting || hasAutoRequested) {
      return;
    }

    void (async () => {
      setRequesting(true);
      setHasAutoRequested(true);
      try {
        const nextRequest = await requestSensitiveActionCode(action);
        setRequest(nextRequest);
        setCooldown(getRemainingSeconds(nextRequest));
        toast.success("Security code sent to your email.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "We could not send the security code right now.",
        );
      } finally {
        setRequesting(false);
      }
    })();
  }, [action, hasAutoRequested, open, request, requestSensitiveActionCode, requesting]);

  useEffect(() => {
    if (!open || cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown, open]);

  const handleResend = async () => {
    setRequesting(true);
    try {
      const nextRequest = await requestSensitiveActionCode(action);
      setRequest(nextRequest);
      setCode("");
      setCooldown(getRemainingSeconds(nextRequest));
      toast.success("A fresh security code is on its way.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not resend the security code right now.",
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleVerify = async () => {
    if (!request) {
      toast.error("Request a security code first.");
      return;
    }

    setVerifying(true);
    try {
      const result = await verifySensitiveActionCode({
        action,
        verificationId: request.verification_id,
        code,
      });
      await onVerified(result.verification_id);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not verify that security code right now.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const countdownLabel = useMemo(() => {
    if (cooldown <= 0) return null;
    return `You can resend a new code in ${cooldown}s.`;
  }, [cooldown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            {request ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div className="space-y-2">
            <DialogTitle>{meta.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {meta.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Security verification method</p>
                <p className="mt-1">
                  We send a short one-time code to{" "}
                  <span className="font-semibold text-foreground">
                    {request?.delivery_target ?? "your verified email"}
                  </span>
                  . The code expires in about 10 minutes and works only once.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-code">Email security code</Label>
            <Input
              id="security-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\s+/g, ""))}
              placeholder="123456"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{countdownLabel ?? "Use the latest code we emailed you."}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-0 text-xs font-semibold text-primary hover:text-primary/85"
                onClick={() => {
                  window.open(meta.helpHref, "_blank", "noopener,noreferrer");
                }}
              >
                Security help
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={requesting || cooldown > 0}
          >
            {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend code"}
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={verifying || requesting || code.trim().length < 6 || !request}
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : meta.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
