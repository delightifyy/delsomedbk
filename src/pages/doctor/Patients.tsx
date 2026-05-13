import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { doctorNav } from "./nav";
import { doctorMock } from "@/data/portalMock";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search } from "lucide-react";

const Patients = () => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<typeof doctorMock.patients[number] | null>(null);
  const filtered = doctorMock.patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.condition.toLowerCase().includes(q.toLowerCase()));

  return (
    <PortalLayout portalName="Doctor EMR" nav={doctorNav}>
      <PageHeader title="Patients" description={`${doctorMock.patients.length} patients in your care.`} />
      <SectionCard>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or condition..." className="pl-9 max-w-md" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Age/Sex</TableHead>
              <TableHead className="hidden md:table-cell">Last Visit</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => setSel(p)}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{p.age} / {p.gender}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{p.lastVisit}</TableCell>
                <TableCell><Badge variant="outline">{p.condition}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {sel && (
            <>
              <SheetHeader><SheetTitle>{sel.name}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Age</p><p className="font-medium mt-1">{sel.age}</p></div>
                  <div className="p-3 bg-muted/50 rounded-lg"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Sex</p><p className="font-medium mt-1">{sel.gender}</p></div>
                  <div className="p-3 bg-muted/50 rounded-lg col-span-2"><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Primary Condition</p><p className="font-medium mt-1">{sel.condition}</p></div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent Activity</p>
                  <ul className="space-y-2 text-xs">
                    <li className="border-l-2 border-primary pl-3 py-1">Last visit on {sel.lastVisit}</li>
                    <li className="border-l-2 border-border pl-3 py-1">2 active prescriptions</li>
                    <li className="border-l-2 border-border pl-3 py-1">Lab results pending</li>
                  </ul>
                </div>
                <Button className="w-full">Open full record</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
};

export default Patients;
