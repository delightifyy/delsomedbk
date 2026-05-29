import { ReactNode } from "react";
import { Link, NavLink, useLocation, Navigate } from "react-router-dom";
import { LucideIcon, LogOut, Bell, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { usePatientCategory, PATIENT_CATEGORY_OPTIONS, PatientCategory } from "@/hooks/usePatientCategory";
import desolmedLogo from "@/assets/desolmed-logo.png";

export type PortalNavItem = { title: string; url: string; icon: LucideIcon };

interface PortalLayoutProps {
  portalName: string;
  portalAccent?: string;
  nav: PortalNavItem[];
  children: ReactNode;
  requireAuth?: boolean;
}

const PortalSidebar = ({ portalName, nav }: { portalName: string; nav: PortalNavItem[] }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-3">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={desolmedLogo} alt="DesolMed" className="h-9 w-9 object-contain shrink-0" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold">
                <span className="text-primary">Desol</span>
                <span className="text-foreground">Med</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {portalName}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {(user?.email?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email ?? "Guest"}</p>
              <button
                onClick={() => signOut()}
                className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" /> Sign out
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export const PortalLayout = ({
  portalName,
  nav,
  children,
  requireAuth = false,
}: PortalLayoutProps) => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (requireAuth && !loading && !user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(pathname)}`} replace />;
  }

  // Compute breadcrumb from path
  const segments = pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <PortalSidebar portalName={portalName} nav={nav} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-3 sm:px-6 sticky top-0 z-30">
            <SidebarTrigger />
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden">
              {segments.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  <span className={i === segments.length - 1 ? "text-foreground font-medium capitalize" : "capitalize"}>
                    {s.replace(/-/g, " ")}
                  </span>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {pathname.startsWith("/patient") && <PatientCategorySelector />}
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
