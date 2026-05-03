import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSession, isAdminUser, signOut as localSignOut, subscribeAuth, type LocalSession } from "@/lib/localStore";

type AuthCtx = {
  user: LocalSession["user"] | null;
  session: LocalSession | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LocalSession["user"] | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getSession();
    setSession(current);
    setUser(current?.user ?? null);
    setIsAdmin(isAdminUser(current?.user.id));
    setLoading(false);

    return subscribeAuth((next) => {
      setSession(next);
      setUser(next?.user ?? null);
      setIsAdmin(isAdminUser(next?.user.id));
    });
  }, []);

  const signOut = async () => {
    await localSignOut();
  };

  return (
    <Ctx.Provider value={{ user, session, isAdmin, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
