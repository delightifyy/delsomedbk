import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  LogOut,
  Home,
  Bell,
  Newspaper,
  Megaphone,
  CircleHelp,
  MessageCircleHeart,
  Menu,
  Stethoscope,
  MailCheck,
  Activity,
  Tags,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import desolmedLogo from "@/assets/desolmed-logo.png";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/notifications", label: "New Registrations", icon: Bell },
  { to: "/dashboard/users", label: "Users", icon: Users },
  { to: "/dashboard/patients", label: "Patients", icon: HeartPulse },
  { to: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/dashboard/contacts", label: "Contact Messages", icon: MessageSquare },
  { to: "/dashboard/blog", label: "Health Adverts", icon: Megaphone },
  { to: "/dashboard/news", label: "News", icon: Newspaper },
  // { to: "/dashboard/newsletter", label: "Newsletter", icon: MailCheck },
  { to: "/dashboard/lookups", label: "Lookups", icon: Tags },
  
  { to: "/dashboard/faqs", label: "FAQs", icon: CircleHelp },
  { to: "/dashboard/testimonials", label: "Testimonials", icon: MessageCircleHeart },
  { to: "/dashboard/activity-logs", label: "Activity Logs", icon: Activity },
];

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const { pathname } = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.admin.applications
      .list({ status: "pending", page: 1 })
      .then((response) => setPendingCount(response.meta?.total ?? collection(response.data).length))
      .catch(() => setPendingCount(0));
  }, []);

  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const renderBadge = (to: string) =>
    to === "/dashboard/notifications" && pendingCount > 0 ? (
      <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold bg-destructive text-primary-foreground">
        {pendingCount}
      </span>
    ) : null;

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-border">
          <img src={desolmedLogo} alt="" className="h-10 w-10 object-contain" /> 
          <span className="font-display text-lg font-black leading-none">Desol<span className="text-secondary">Med</span></span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive(it.to, it.end)
                  ? "bg-primary-soft text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
              {renderBadge(it.to)}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <p className="px-3 text-xs text-muted-foreground truncate">{user?.email}</p>
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-30 h-14 bg-card border-b border-border flex items-center justify-between gap-3 px-3 sm:px-4">
        <Link to="/" className="min-w-0 font-display text-base font-black leading-none truncate">
          Desol<span className="text-secondary">Med</span> · Admin
        </Link>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="ghost" className="shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[82vw] max-w-sm p-0">
              <SheetHeader className="px-6 py-4 border-b border-border text-left">
                <SheetTitle className="font-display text-left">
                  Desol<span className="text-secondary">Med</span> Admin
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-4rem)] overflow-y-auto">
                <nav className="p-3 space-y-1">
                  {items.map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive(it.to, it.end)
                          ? "bg-primary-soft text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <it.icon className="h-4 w-4" />
                      <span className="flex-1">{it.label}</span>
                      {renderBadge(it.to)}
                    </Link>
                  ))}
                </nav>
                <div className="p-3 border-t border-border space-y-2">
                  <p className="px-3 text-xs text-muted-foreground truncate">{user?.email}</p>
                  <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                    <Link to="/"><Home className="h-4 w-4" /> Back to site</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button size="sm" variant="ghost" onClick={signOut} className="shrink-0"><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b border-border bg-card">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs whitespace-nowrap inline-flex items-center gap-1.5",
                isActive(it.to, it.end) ? "bg-primary-soft text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {it.label}
              {it.to === "/dashboard/notifications" && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-warning/20 text-warning text-[10px] font-semibold">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
