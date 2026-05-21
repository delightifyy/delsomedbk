import { CreditCard, BadgeCheck, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type AccessMethod = "card" | "subscription" | "hmo" | "organization";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (method: AccessMethod) => void;
};

const OPTIONS: {
  key: AccessMethod;
  title: string;
  desc: string;
  icon: any;
  accent: string;
}[] = [
  {
    key: "card",
    title: "Card Payment",
    desc: "Pay securely with your debit or credit card",
    icon: CreditCard,
    accent: "from-primary/15 to-primary/5 border-primary/30",
  },
  {
    key: "subscription",
    title: "Subscription",
    desc: "Use your active DesolMed subscription plan",
    icon: BadgeCheck,
    accent: "from-secondary/40 to-secondary/10 border-secondary",
  },
  {
    key: "hmo",
    title: "HMO",
    desc: "Book using your Health Maintenance Organization",
    icon: ShieldCheck,
    accent: "from-emerald-100 to-emerald-50 border-emerald-300",
  },
  {
    key: "organization",
    title: "Organization",
    desc: "Book true your organization",
    icon: Building2,
    accent: "from-amber-100 to-amber-50 border-amber-300",
  },
];

export default function AccessMethodModal({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose how you'd like to book</DialogTitle>
          <DialogDescription>
            Select your preferred access method to continue with your appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onSelect(opt.key)}
                className={`group text-left rounded-xl border-2 bg-gradient-to-br ${opt.accent} p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-background/80 p-2.5 shadow-sm">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-base text-foreground">
                        {opt.title}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-snug">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          {"\n"}
        </p>
      </DialogContent>
    </Dialog>
  );
}
