import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { orgNav } from "./nav";
import { orgMock } from "@/data/portalMock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2 } from "lucide-react";

const Staff = () => {
  const [q, setQ] = useState("");
  const [staff, setStaff] = useState(orgMock.staff);
  const filtered = staff.filter((s) => [s.name, s.department, s.email].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <PortalLayout portalName="HMO Portal" nav={orgNav}>
      <PageHeader
        title="Staff Management"
        description={`${staff.length} staff members enrolled.`}
        action={
          <Dialog>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add Staff</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add new staff member</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Full name</Label><Input className="mt-1.5" /></div>
                <div><Label>Email</Label><Input type="email" className="mt-1.5" /></div>
                <div><Label>Department</Label><Input className="mt-1.5" /></div>
              </div>
              <DialogFooter><Button>Send invitation</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <SectionCard>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 max-w-md" placeholder="Search staff..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.email}</TableCell>
                <TableCell><Badge variant="outline">{s.department}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{s.joined}</TableCell>
                <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"} className="capitalize">{s.status}</Badge></TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => setStaff(staff.filter((x) => x.id !== s.id))}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </PortalLayout>
  );
};

export default Staff;
