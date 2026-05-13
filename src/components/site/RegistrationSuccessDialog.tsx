import { Link } from "react-router-dom";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RegistrationSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
};

export const RegistrationSuccessDialog = ({
  open,
  onOpenChange,
  title,
  description,
  primaryLabel = "Done",
  primaryHref,
  secondaryLabel = "Close",
}: RegistrationSuccessDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
      <div className="bg-primary-soft px-5 py-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-background text-primary shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <DialogHeader className="mt-3 space-y-2 text-center">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <MailCheck className="h-4 w-4 text-secondary" /> Email update
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Please check your email inbox and spam folder for the next message from DesolMed.
          </p>
        </div>
      </div>

      <DialogFooter className="border-t border-border px-5 py-3.5 sm:justify-between">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          {secondaryLabel}
        </Button>
        {primaryHref ? (
          <Button asChild variant="hero">
            <Link to={primaryHref}>{primaryLabel}</Link>
          </Button>
        ) : (
          <Button type="button" variant="hero" onClick={() => onOpenChange(false)}>
            {primaryLabel}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
