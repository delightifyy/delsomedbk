import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "primary" | "secondary" | "muted";
}) => (
  <Card className="overflow-hidden border-border/60 hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-display font-bold mt-2">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "secondary" && "bg-secondary text-foreground",
            accent === "muted" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6 border-2 border-dashed border-border rounded-xl bg-card/40">
    <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="font-display font-semibold text-lg">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const SectionCard = ({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <Card className={cn("border-border/60", className)}>
    {(title || action) && (
      <div className="flex items-start justify-between gap-3 p-5 pb-3 border-b border-border/60">
        <div>
          {title && <h3 className="font-display font-semibold">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
    )}
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);
