// hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { getSession, signOut as localSignOut, type LocalSession } from "@/lib/localStore";
import { api, getStoredAuthToken, clearApiAuthState, setStoredAuthToken } from "@/lib/api";

type User = {
  id: string;
  uuid: string;
  email: string;
  name?: string;
  role?: string;
  is_admin?: boolean;
  roles?: string[];
};

type AuthCtx = {
  user: User | null;
  session: LocalSession | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refetchUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // Helper to check admin role from API user data
  const checkAdminRole = (userData: any): boolean => {
    if (!userData) return false;
    
    // Check roles array
    if (userData.roles && Array.isArray(userData.roles)) {
      if (userData.roles.includes("admin") || userData.roles.includes("super_admin")) {
        return true;
      }
    }
    // Check role field
    if (userData.role === "admin" || userData.role === "super_admin") {
      return true;
    }
    // Check is_admin flag
    if (userData.is_admin === true) {
      return true;
    }
    return false;
  };

  const fetchUserFromAPI = useCallback(async () => {
    const token = getStoredAuthToken();
    
    if (!token) {
      if (isMounted.current) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      return null;
    }

    try {
      console.log("🔍 Fetching user from API...");
      const response = await api.auth.me();
      
      if (response.data && isMounted.current) {
        const userData = response.data as User;
        const hasAdminRole = checkAdminRole(userData);
        
        console.log("📦 User data from API:", userData);
        console.log("👑 Has admin role:", hasAdminRole);
        
        setUser(userData);
        setIsAdmin(hasAdminRole);
        
        // Only set session from API data, ignore local storage
        const localSession: LocalSession = {
          user: {
            id: userData.uuid || userData.id,
            email: userData.email,
            full_name: userData.name || (userData as any).full_name,
            ...(userData.role ? { role: userData.role } : {}),
          } as LocalSession["user"],
          token: token,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          roles: userData.roles,
        };
        setSession(localSession);
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error("❌ Fetch user error:", error);
      if (isMounted.current) {
        // Don't clear user state on network errors, only on auth errors
        if (error instanceof Error && (error.message.includes("401") || error.message.includes("403"))) {
          clearApiAuthState();
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      }
      return null;
    }
  }, []);

  const refetchUser = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    await fetchUserFromAPI();
    setLoading(false);
  }, [fetchUserFromAPI]);

  useEffect(() => {
    isMounted.current = true;
    
    const initAuth = async () => {
      setLoading(true);
      
      // ONLY use API token - completely ignore local session
      const apiToken = getStoredAuthToken();
      
      if (apiToken) {
        console.log("🔑 API token found, fetching user...");
        await fetchUserFromAPI();
      } else {
        console.log("❌ No API token found");
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    initAuth();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const signOut = async () => {
    console.log("🚪 Signing out...");
    try {
      const token = getStoredAuthToken();
      if (token) {
        await api.auth.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearApiAuthState();
      localStorage.removeItem("carehub-local-session");
      await localSignOut();
      if (isMounted.current) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
    }
  };

  return (
    <Ctx.Provider value={{ user, session, isAdmin, loading, signOut, refetchUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);