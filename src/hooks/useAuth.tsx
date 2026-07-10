import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getSession, setStoredSession, signOut as localSignOut, subscribeAuth, type LocalSession } from "@/lib/localStore";
import {
  api,
  ApiError,
  clearApiAuthState,
  getStoredAuthToken,
  getStoredAuthUser,
  normalizeRoleList,
  setStoredAuthToken,
  setStoredAuthUser,
} from "@/lib/api";

type User = {
  id: string;
  uuid: string;
  email: string;
  name?: string;
  role?: string;
  user_type?: string;
  is_admin?: boolean;
  is_doctor?: boolean;
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

const ADMIN_ROLES = new Set(["admin", "super_admin", "administrator"]);
const DOCTOR_ROLES = new Set(["doctor", "physician", "provider", "consultant"]);

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? value as Record<string, any> : {};

const fullNameFrom = (value: Record<string, any>) =>
  [value.first_name, value.last_name].filter(Boolean).join(" ").trim() ||
  String(value.full_name ?? value.name ?? value.display_name ?? "").trim();

const unwrapUserPayload = (payload: unknown) => {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root);
  return data.user ?? data.doctor ?? data.profile ?? data;
};

const hasAnyRole = (roles: string[] | undefined, allowed: Set<string>) =>
  Boolean(roles?.some((role) => allowed.has(role.toLowerCase())));

const normalizeUser = (value: unknown, fallback?: Partial<User> | null): User | null => {
  const record = asRecord(value);
  const fallbackRecord = asRecord(fallback);
  const email = String(record.email ?? fallbackRecord.email ?? "").trim();
  const id = String(record.uuid ?? record.id ?? fallbackRecord.uuid ?? fallbackRecord.id ?? email ?? "api-user");
  if (!id && !email) return null;

  const role = String(record.role ?? record.user_type ?? fallbackRecord.role ?? "").trim().toLowerCase();
  const roles = normalizeRoleList(record.roles ?? fallbackRecord.roles);

  if (role && !roles.includes(role)) roles.push(role);
  if (record.user_type === "doctor" && !roles.includes("doctor")) roles.push("doctor");
  if (record.is_doctor === true && !roles.includes("doctor")) roles.push("doctor");
  if (record.is_admin === true && !roles.includes("admin")) roles.push("admin");

  return {
    id,
    uuid: String(record.uuid ?? fallbackRecord.uuid ?? id),
    email,
    name: fullNameFrom(record) || fallbackRecord.name,
    role: role || undefined,
    user_type: String(record.user_type ?? fallbackRecord.user_type ?? "").trim() || undefined,
    is_admin: record.is_admin === true || fallbackRecord.is_admin === true,
    is_doctor: record.is_doctor === true || fallbackRecord.is_doctor === true,
    roles,
  };
};

const sessionFromUser = (user: User, token: string, previous?: LocalSession | null): LocalSession => ({
  user: {
    id: user.uuid || user.id,
    email: user.email,
    full_name: user.name ?? previous?.user.full_name ?? null,
    created_at: previous?.user.created_at ?? new Date().toISOString(),
    ...(user.role ? { role: user.role } : {}),
  } as LocalSession["user"],
  token,
  roles: user.roles,
  token_type: previous?.token_type,
  expires_in: previous?.expires_in,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const applyUser = useCallback((nextUser: User | null, token: string | null, previous?: LocalSession | null) => {
    if (!isMounted.current) return null;

    if (!nextUser || !token) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      return null;
    }

    const nextSession = sessionFromUser(nextUser, token, previous);
    const nextIsAdmin =
      nextUser.is_admin === true ||
      nextUser.role === "admin" ||
      nextUser.role === "super_admin" ||
      hasAnyRole(nextUser.roles, ADMIN_ROLES);

    setUser(nextUser);
    setSession(nextSession);
    setIsAdmin(nextIsAdmin);
    setStoredAuthUser(nextUser);
    setStoredSession(nextSession);
    return nextUser;
  }, []);

  const applyCachedSession = useCallback((token: string | null, previous?: LocalSession | null) => {
    const previousUser = previous ? { ...(previous.user as Record<string, unknown>), roles: previous.roles } : undefined;
    const cachedUser = normalizeUser(getStoredAuthUser(), previousUser as Partial<User> | undefined);
    if (cachedUser && token) {
      return applyUser(cachedUser, token, previous);
    }
    if (previous?.token) {
      const sessionUser = normalizeUser(previous.user, { roles: previous.roles });
      return applyUser(sessionUser, previous.token, previous);
    }
    return null;
  }, [applyUser]);

  const fetchUserFromAPI = useCallback(async () => {
    const storedSession = getSession();
    const token = getStoredAuthToken() ?? storedSession?.token ?? null;

    if (!token) {
      if (isMounted.current) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      return null;
    }

    if (!getStoredAuthToken()) {
      setStoredAuthToken(token);
    }

    try {
      const response = await api.auth.me();
      const userData = normalizeUser(unwrapUserPayload(response), getStoredAuthUser() ?? storedSession?.user);
      return applyUser(userData, token, storedSession);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearApiAuthState();
        if (isMounted.current) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
        return null;
      }

      return applyCachedSession(token, storedSession);
    }
  }, [applyCachedSession, applyUser]);

  const refetchUser = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    await fetchUserFromAPI();
    if (isMounted.current) setLoading(false);
  }, [fetchUserFromAPI]);

  useEffect(() => {
    isMounted.current = true;

    const initAuth = async () => {
      setLoading(true);
      await fetchUserFromAPI();
      if (isMounted.current) setLoading(false);
    };

    initAuth();

    return () => {
      isMounted.current = false;
    };
  }, [fetchUserFromAPI]);

  useEffect(() => {
    const unsubscribe = subscribeAuth((nextSession) => {
      if (!isMounted.current) return;
      const token = getStoredAuthToken() ?? nextSession?.token ?? null;

      if (nextSession && token) {
        applyCachedSession(token, nextSession);
        return;
      }

      setUser(null);
      setSession(null);
      setIsAdmin(false);
    });

    return unsubscribe;
  }, [applyCachedSession]);

  const signOut = async () => {
    try {
      if (getStoredAuthToken()) {
        await api.auth.logout();
      }
    } catch {
      // Local cleanup still needs to happen even when the API token is already expired.
    } finally {
      clearApiAuthState();
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
