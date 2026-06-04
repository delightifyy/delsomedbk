import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

type Package = { name: "Individual" | "Family"; price: number };
const INDIVIDUAL: Package = { name: "Individual", price: 50000 };
const FAMILY: Package = { name: "Family", price: 100000 };

type Subscriber = {
  id: string;
  name: string;
  email: string;
  subscribedAt: Date;
  expiresAt: Date;
  pkg: Package;
};

const NAMES = [
  "Adaeze Okafor", "Chinedu Eze", "Funmi Adebayo", "Tunde Bakare", "Ngozi Umeh",
  "Ifeanyi Obi", "Bola Ahmed", "Yetunde Ojo", "Emeka Nwosu", "Zainab Yusuf",
  "Kunle Adeyemi", "Halima Sani", "Obinna Madu", "Chiamaka Eze", "Segun Lawal",
  "Aisha Bello", "Uche Nnamdi", "Folake Akin", "Dapo Ogun", "Rita Eke",
  "Suleiman Ali", "Blessing John", "Tope Hassan", "Ifechi Ude", "Maryam Ibrahim",
  "Kelechi Onu", "Damilola Smith", "Nkechi Iwu", "Bayo Salami", "Ada Nwankwo",
];

const pad = (n: number, w = 4) => String(n).padStart(w, "0");

const SUBSCRIBERS: Subscriber[] = NAMES.map((name, i) => {
  const start = new Date(2025, 5, 4);
  start.setDate(start.getDate() - i * 9);
  const expires = new Date(start);
  expires.setFullYear(expires.getFullYear() + 1);
  return {
    id: `DSM-SUB-${pad(1001 + i)}`,
    name,
    email: name.toLowerCase().replace(/\s+/g, ".") + "@example.com",
    subscribedAt: start,
    expiresAt: expires,
    pkg: i % 2 === 0 ? INDIVIDUAL : FAMILY,
  };
});

const PAGE_SIZE = 8;
const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtMoney = (n: number) => "₦" + n.toLocaleString();

const SubscribersPage = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(SUBSCRIBERS.length / PAGE_SIZE);
  const pageItems = useMemo(
    () => SUBSCRIBERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page],
  );

  const stats = useMemo(() => {
    const ind = SUBSCRIBERS.filter((s) => s.pkg.name === "Individual").length;
    const fam = SUBSCRIBERS.length - ind;
    return { total: SUBSCRIBERS.length, ind, fam };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All DesolMed subscription members with package and renewal details.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Subscribers</p>
          <p className="font-display text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Individual ({fmtMoney(50000)}/yr)</p>
          <p className="font-display text-2xl font-bold">{stats.ind}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Family ({fmtMoney(100000)}/yr)</p>
          <p className="font-display text-2xl font-bold">{stats.fam}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unique ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Subscribe Date</TableHead>
              <TableHead>Expire Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary-soft text-primary inline-flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      "rounded-full px-2 py-1 text-xs font-medium " +
                      (s.pkg.name === "Family"
                        ? "bg-secondary/20 text-secondary-foreground"
                        : "bg-primary-soft text-primary")
                    }
                  >
                    {s.pkg.name}
                  </span>
                </TableCell>
                <TableCell>{fmtMoney(s.pkg.price)}</TableCell>
                <TableCell>{fmtDate(s.subscribedAt)}</TableCell>
                <TableCell>{fmtDate(s.expiresAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · Showing {pageItems.length} of {SUBSCRIBERS.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscribersPage;
