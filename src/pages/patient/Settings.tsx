import { useState, useEffect, FormEvent } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PageHeader, SectionCard } from "@/components/portal/PortalUI";
import { patientNav } from "./nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import desolmedLogo from "@/assets/desolmed-logo.png";

interface PatientProfile {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  blood_type?: string;
  next_of_kin?: {
    full_name: string;
    phone: string;
    relationship: string;
  };
}

interface NotificationPrefs {
  marketing_emails: boolean;
}

interface SecurityPrefs {
  two_factor_enabled: boolean;
}

// Loading screen component with Desolmed logo - NO spinner
const SettingsLoadingScreen = () => (
  <PortalLayout portalName="Patient Portal" nav={patientNav}>
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>
          <div className="relative animate-bounce">
            <img 
              src={desolmedLogo} 
              alt="Desolmed" 
              className="w-28 h-28 mx-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  </PortalLayout>
);

const PatientSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<PatientProfile>({
    first_name: "",
    email: "",
    phone: "",
    address: "",
    blood_type: "",
    next_of_kin: {
      full_name: "",
      phone: "",
      relationship: "",
    },
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  
  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    marketing_emails: false,
  });
  
  // Security preferences
  const [securityPrefs, setSecurityPrefs] = useState<SecurityPrefs>({
    two_factor_enabled: false,
  });

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load profile
        const profileRes = await api.me.patient.profile();
        if (profileRes.data) {
          setProfile({
            first_name: profileRes.data.first_name || "",
            last_name: profileRes.data.last_name || "",
            email: profileRes.data.email || "",
            phone: profileRes.data.phone || "",
            address: profileRes.data.address || "",
            blood_type: profileRes.data.blood_type || "",
            next_of_kin: profileRes.data.next_of_kin || {
              full_name: "",
              phone: "",
              relationship: "",
            },
          });
        }
        
        // Load notification preferences
        // You may need to fetch these from a separate endpoint or they come with profile
        // For now, we'll assume they come with profile or we set defaults
        
        // Load security preferences
        // Similarly, fetch from API if available
        
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message || "Could not load your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Handle profile update
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    
    try {
      const updateData = {
        first_name: profile.first_name,
        address: profile.address,
        blood_type: profile.blood_type,
        next_of_kin: profile.next_of_kin,
      };
      
      const response = await api.me.patient.updateProfile(updateData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh profile data
      const freshProfile = await api.me.patient.profile();
      if (freshProfile.data) {
        setProfile({
          first_name: freshProfile.data.first_name || "",
          last_name: freshProfile.data.last_name || "",
          email: freshProfile.data.email || "",
          phone: freshProfile.data.phone || "",
          address: freshProfile.data.address || "",
          blood_type: freshProfile.data.blood_type || "",
          next_of_kin: freshProfile.data.next_of_kin,
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update your profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.password_confirmation) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setSavingPassword(true);
    
    try {
      await api.me.patient.changePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Clear password fields
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message || "Could not change your password",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle notification preferences update
  const handleNotificationUpdate = async (marketingEmails: boolean) => {
    setSavingNotifications(true);
    
    try {
      await api.me.patient.notificationPreferences({
        marketing_emails: marketingEmails,
      });
      
      setNotificationPrefs({ marketing_emails: marketingEmails });
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
      
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update preferences",
        variant: "destructive",
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  // Handle security preferences update
  const handleSecurityUpdate = async (twoFactorEnabled: boolean) => {
    setSavingSecurity(true);
    
    try {
      await api.me.patient.securityPreferences({
        two_factor_enabled: twoFactorEnabled,
      });
      
      setSecurityPrefs({ two_factor_enabled: twoFactorEnabled });
      
      toast({
        title: "Security settings updated",
        description: twoFactorEnabled 
          ? "Two-factor authentication has been enabled."
          : "Two-factor authentication has been disabled.",
      });
      
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update security settings",
        variant: "destructive",
      });
    } finally {
      setSavingSecurity(false);
    }
  };

  // Show loading screen with Desolmed logo
  if (loading) {
    return <SettingsLoadingScreen />;
  }

  return (
    <PortalLayout portalName="Patient Portal" nav={patientNav}>
      <PageHeader title="Settings" description="Manage your account preferences." />
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <SectionCard title="Personal information">
            <form onSubmit={handleProfileUpdate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full name</Label>
                  <Input 
                    value={profile.first_name} 
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="mt-1.5" 
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={profile.email} 
                    disabled
                    className="mt-1.5 bg-muted" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={profile.phone || ""} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1.5" 
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <Label>Blood Type</Label>
                  <select 
                    value={profile.blood_type || ""}
                    onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1.5"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={profile.address || ""} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="mt-1.5" 
                    placeholder="Your residential address"
                  />
                </div>
              </div>
              
              {/* Next of Kin Section */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-4">Next of Kin</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Full name</Label>
                    <Input 
                      value={profile.next_of_kin?.full_name || ""} 
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        next_of_kin: { ...profile.next_of_kin!, full_name: e.target.value } 
                      })}
                      className="mt-1.5" 
                      placeholder="Next of kin full name"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={profile.next_of_kin?.phone || ""} 
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        next_of_kin: { ...profile.next_of_kin!, phone: e.target.value } 
                      })}
                      className="mt-1.5" 
                      placeholder="Next of kin phone"
                    />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Input 
                      value={profile.next_of_kin?.relationship || ""} 
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        next_of_kin: { ...profile.next_of_kin!, relationship: e.target.value } 
                      })}
                      className="mt-1.5" 
                      placeholder="e.g., Brother, Sister, Parent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <div className="relative w-4 h-4 mr-2">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                        <div className="relative animate-bounce">
                          <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                      </div>
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>
        
        {/* Password Tab */}
        <TabsContent value="password" className="mt-4">
          <SectionCard title="Change password">
            <form onSubmit={handlePasswordChange}>
              <div className="grid gap-4 max-w-md">
                <div>
                  <Label>Current password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="mt-1.5" 
                    required
                  />
                </div>
                <div>
                  <Label>New password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="mt-1.5" 
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <Input 
                    type="password" 
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    className="mt-1.5" 
                    required
                  />
                </div>
              </div>
              <div className="mt-5">
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? (
                    <>
                      <div className="relative w-4 h-4 mr-2">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-sm animate-pulse"></div>
                        <div className="relative animate-bounce">
                          <img src={desolmedLogo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                      </div>
                      Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Notification preferences">
            <div className="space-y-4">
              {[
                { key: "appointment_reminders", label: "Appointment reminders", desc: "Get reminded 24 hours before each visit.", enabled: true },
                { key: "prescription_refills", label: "Prescription refills", desc: "Notify when refills are due.", enabled: true },
                { key: "lab_results", label: "Lab results", desc: "Email me when new results are available.", enabled: true },
                { key: "marketing_emails", label: "Marketing emails", desc: "Health tips and product updates.", enabled: notificationPrefs.marketing_emails },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  {n.key === "marketing_emails" ? (
                    <Switch 
                      checked={notificationPrefs.marketing_emails}
                      onCheckedChange={(checked) => handleNotificationUpdate(checked)}
                      disabled={savingNotifications}
                    />
                  ) : (
                    <Switch defaultChecked={n.enabled} disabled />
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <SectionCard title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of protection to your account.</p>
                </div>
                <Switch 
                  checked={securityPrefs.two_factor_enabled}
                  onCheckedChange={(checked) => handleSecurityUpdate(checked)}
                  disabled={savingSecurity}
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <div>
                  <p className="text-sm font-medium">Login alerts</p>
                  <p className="text-xs text-muted-foreground">Email me when a new device signs in.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            {securityPrefs.two_factor_enabled && (
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-2">Two-factor authentication is enabled</p>
                <p className="text-xs text-muted-foreground">
                  Your account is protected with an extra layer of security. 
                  You'll need to provide a verification code from your authenticator app when signing in.
                </p>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  );
};

export default PatientSettings;