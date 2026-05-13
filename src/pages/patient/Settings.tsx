import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { patientMock } from "@/data/portalMock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const PatientSettings = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <PageHeader title="Settings" description="Manage your account preferences." />
    <Tabs defaultValue="profile" className="w-full">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4">
        <SectionCard title="Personal information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Full name</Label><Input defaultValue={patientMock.profile.name} className="mt-1.5" /></div>
            <div><Label>Email</Label><Input defaultValue={patientMock.profile.email} className="mt-1.5" /></div>
            <div><Label>Phone</Label><Input defaultValue={patientMock.profile.phone} className="mt-1.5" /></div>
            <div><Label>Address</Label><Input defaultValue={patientMock.profile.address} className="mt-1.5" /></div>
          </div>
          <div className="mt-5"><Button>Save changes</Button></div>
        </SectionCard>
      </TabsContent>
      <TabsContent value="password" className="mt-4">
        <SectionCard title="Change password">
          <div className="grid gap-4 max-w-md">
            <div><Label>Current password</Label><Input type="password" className="mt-1.5" /></div>
            <div><Label>New password</Label><Input type="password" className="mt-1.5" /></div>
            <div><Label>Confirm new password</Label><Input type="password" className="mt-1.5" /></div>
          </div>
          <div className="mt-5"><Button>Update password</Button></div>
        </SectionCard>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <SectionCard title="Notification preferences">
          <div className="space-y-4">
            {[
              { label: "Appointment reminders", desc: "Get reminded 24 hours before each visit." },
              { label: "Prescription refills", desc: "Notify when refills are due." },
              { label: "Lab results", desc: "Email me when new results are available." },
              { label: "Marketing emails", desc: "Health tips and product updates." },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                <Switch defaultChecked={i < 3} />
              </div>
            ))}
          </div>
        </SectionCard>
      </TabsContent>
      <TabsContent value="security" className="mt-4">
        <SectionCard title="Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Two-factor authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of protection.</p></div><Switch /></div>
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Login alerts</p><p className="text-xs text-muted-foreground">Email me on new device sign-in.</p></div><Switch defaultChecked /></div>
          </div>
        </SectionCard>
      </TabsContent>
    </Tabs>
  </PortalLayout>
);

export default PatientSettings;
