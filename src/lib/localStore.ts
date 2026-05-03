import { ADVERTS } from "@/data/doctors";
import { BLOG_POSTS } from "@/data/blogs";

export type LocalRole = "admin" | "user";
export type UserType = "patient" | "doctor" | "organization" | "pharmacy" | "lab-diagnostics";

export type LocalUser = {
  id: string;
  email: string;
  full_name: string | null;
  password: string;
  created_at: string;
};

export type LocalSession = {
  user: Omit<LocalUser, "password">;
};

export type LocalProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  organization_name: string | null;
  user_type: UserType | null;
  created_at: string;
};

export type LocalUserRole = {
  user_id: string;
  role: LocalRole;
};

export type LocalContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  state: string | null;
  read: boolean;
  created_at: string;
};

export type LocalBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
  author_id: string | null;
  created_at: string;
};

export type LocalRegistrationDoc = {
  label: string;
  field: string;
  path: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export type LocalRegistration = {
  id: string;
  applicant_type: UserType;
  status: "pending" | "approved" | "rejected";
  full_name: string | null;
  organization_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  zone: string | null;
  specialty: string | null;
  details: Record<string, unknown>;
  documents: LocalRegistrationDoc[];
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type LocalAdvert = {
  id: string;
  title: string;
  sponsor: string;
  category: string;
  zone: string;
  state: string;
  city: string;
  description: string;
  created_at: string;
};

type StoreState = {
  users: LocalUser[];
  profiles: LocalProfile[];
  roles: LocalUserRole[];
  contacts: LocalContactMessage[];
  posts: LocalBlogPost[];
  registrations: LocalRegistration[];
  adverts: LocalAdvert[];
};

const STORE_KEY = "carehub-local-store";
const SESSION_KEY = "carehub-local-session";
const AUTH_EVENT = "carehub-auth-change";
const STORE_EVENT = "carehub-store-change";

const now = () => new Date().toISOString();

const safeClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const defaultAdmin = (): LocalUser => ({
  id: "local-admin",
  email: "admin@carehub.local",
  full_name: "Site Admin",
  password: "admin1234",
  created_at: now(),
});

const seedStore = (): StoreState => {
  const admin = defaultAdmin();
  return {
    users: [admin],
    profiles: [
      {
        id: admin.id,
        full_name: admin.full_name,
        avatar_url: null,
        email: admin.email,
        phone: null,
        organization_name: null,
        user_type: null,
        created_at: admin.created_at,
      },
    ],
    roles: [{ user_id: admin.id, role: "admin" }],
    contacts: [],
    posts: BLOG_POSTS.map((post, index) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.excerpt,
      cover_image: post.cover,
      published: true,
      author_id: admin.id,
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
    })),
    registrations: [],
    adverts: ADVERTS.map((advert, index) => ({
      id: advert.id,
      title: advert.title,
      sponsor: advert.sponsor,
      category: advert.category,
      zone: advert.zone,
      state: advert.state,
      city: advert.city,
      description: advert.description,
      created_at: new Date(Date.now() - index * 43200000).toISOString(),
    })),
  };
};

const readStore = (): StoreState => {
  if (typeof window === "undefined") return seedStore();

  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    const initial = seedStore();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    const fallback = seedStore();
    const next: StoreState = {
      users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : fallback.users,
      profiles: Array.isArray(parsed.profiles) && parsed.profiles.length > 0 ? parsed.profiles : fallback.profiles,
      roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : fallback.roles,
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      posts: Array.isArray(parsed.posts) && parsed.posts.length > 0 ? parsed.posts : fallback.posts,
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      adverts: Array.isArray(parsed.adverts) && parsed.adverts.length > 0 ? parsed.adverts : fallback.adverts,
    };
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
    return next;
  } catch {
    const initial = seedStore();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initial));
    return initial;
  }
};

const writeStore = (next: StoreState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STORE_EVENT));
};

const readSession = (): LocalSession | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
};

const writeSession = (session: LocalSession | null) => {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const publicUser = (user: LocalUser): LocalSession["user"] => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  created_at: user.created_at,
});

const save = (mutate: (state: StoreState) => void) => {
  const next = safeClone(readStore());
  mutate(next);
  writeStore(next);
};

const sortNewest = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

export const subscribeAuth = (listener: (session: LocalSession | null) => void) => {
  const handler = () => listener(readSession());
  handler();
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

export const subscribeStore = (listener: () => void) => {
  const handler = () => listener();
  handler();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

export const getSession = () => readSession();

export const getCurrentUser = () => readSession()?.user ?? null;

export const getCurrentUserRole = (userId?: string | null) => {
  if (!userId) return null;
  return readStore().roles.find((role) => role.user_id === userId)?.role ?? null;
};

export const isAdminUser = (userId?: string | null) => getCurrentUserRole(userId) === "admin";

export const signUp = async ({ email, password, fullName }: { email: string; password: string; fullName?: string }) => {
  const store = readStore();
  const existing = store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const user: LocalUser = {
    id: crypto.randomUUID(),
    email,
    full_name: fullName?.trim() || null,
    password,
    created_at: now(),
  };

  save((state) => {
    state.users.push(user);
    state.profiles.push({
      id: user.id,
      full_name: user.full_name,
      avatar_url: null,
      email: user.email,
      phone: null,
      organization_name: null,
      user_type: null,
      created_at: user.created_at,
    });
    state.roles.push({ user_id: user.id, role: "user" });
  });

  return { data: { user: publicUser(user) } };
};

export const signInWithPassword = async ({ email, password }: { email: string; password: string }) => {
  const store = readStore();
  const normalizedEmail = email.trim().toLowerCase();
  let user = store.users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

  if (user) {
    save((state) => {
      const existing = state.users.find((candidate) => candidate.id === user!.id);
      if (existing) {
        existing.password = password;
      }
      const role = state.roles.find((entry) => entry.user_id === user!.id);
      if (!role) {
        state.roles.push({ user_id: user!.id, role: "admin" });
      } else {
        role.role = "admin";
      }
    });
    user = readStore().users.find((candidate) => candidate.id === user.id) ?? user;
  } else {
    user = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      full_name: null,
      password,
      created_at: now(),
    };

    save((state) => {
      state.users.push(user!);
      state.profiles.push({
        id: user!.id,
        full_name: null,
        avatar_url: null,
        email: user!.email,
        phone: null,
        organization_name: null,
        user_type: null,
        created_at: user!.created_at,
      });
      state.roles.push({ user_id: user!.id, role: "admin" });
    });
  }

  const session: LocalSession = { user: publicUser(user) };
  writeSession(session);
  return { data: { session } };
};

export const signOut = async () => {
  writeSession(null);
  return { error: null };
};

export const ensureSessionUser = (userId: string) => {
  const store = readStore();
  const user = store.users.find((item) => item.id === userId);
  if (!user) return null;
  return publicUser(user);
};

export const listProfiles = () => sortNewest(readStore().profiles);

export const listUserRoles = () => [...readStore().roles];

export const setUserRole = async (userId: string, role: LocalRole) => {
  save((state) => {
    state.roles = state.roles.filter((entry) => entry.user_id !== userId);
    state.roles.push({ user_id: userId, role });
  });
};

export const listContactMessages = () => sortNewest(readStore().contacts);

export const addContactMessage = async (message: Omit<LocalContactMessage, "id" | "read" | "created_at">) => {
  const entry: LocalContactMessage = { ...message, id: crypto.randomUUID(), read: false, created_at: now() };
  save((state) => {
    state.contacts.unshift(entry);
  });
  return entry;
};

export const markContactMessageRead = async (id: string) => {
  save((state) => {
    const target = state.contacts.find((entry) => entry.id === id);
    if (target) target.read = true;
  });
};

export const deleteContactMessage = async (id: string) => {
  save((state) => {
    state.contacts = state.contacts.filter((entry) => entry.id !== id);
  });
};

export const listBlogPosts = () => sortNewest(readStore().posts);

export const upsertBlogPost = async (
  input: Omit<LocalBlogPost, "id" | "created_at"> & { id?: string }
) => {
  let saved: LocalBlogPost | null = null;
  save((state) => {
    if (input.id) {
      const index = state.posts.findIndex((entry) => entry.id === input.id);
      if (index >= 0) {
        saved = { ...state.posts[index], ...input, id: input.id };
        state.posts[index] = saved;
        return;
      }
    }
    saved = {
      ...input,
      id: input.id ?? crypto.randomUUID(),
      created_at: now(),
    };
    state.posts.unshift(saved);
  });
  return saved!;
};

export const deleteBlogPost = async (id: string) => {
  save((state) => {
    state.posts = state.posts.filter((entry) => entry.id !== id);
  });
};

export const listRegistrations = () => sortNewest(readStore().registrations);

export const countPendingRegistrations = () => readStore().registrations.filter((entry) => entry.status === "pending").length;

export const updateRegistration = async (
  id: string,
  patch: Partial<Pick<LocalRegistration, "status" | "reviewer_notes" | "reviewed_at">>
) => {
  save((state) => {
    const target = state.registrations.find((entry) => entry.id === id);
    if (target) Object.assign(target, patch);
  });
};

export const createRegistration = async (input: {
  applicant_type: UserType;
  full_name?: string | null;
  organization_name?: string | null;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zone?: string | null;
  specialty?: string | null;
  details: Record<string, unknown>;
  documents: Array<{ label: string; field: string; file: File }>;
  password?: string;
}) => {
  const documents: LocalRegistrationDoc[] = [];

  for (const slot of input.documents) {
    const dataUrl = await readFileAsDataUrl(slot.file);
    documents.push({
      label: slot.label,
      field: slot.field,
      path: `${input.applicant_type}/${crypto.randomUUID()}/${slot.field}-${slot.file.name}`,
      name: slot.file.name,
      size: slot.file.size,
      type: slot.file.type,
      dataUrl,
    });
  }

  const registration: LocalRegistration = {
    id: crypto.randomUUID(),
    applicant_type: input.applicant_type,
    status: "pending",
    full_name: input.full_name ?? null,
    organization_name: input.organization_name ?? null,
    email: input.email,
    phone: input.phone ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    zone: input.zone ?? null,
    specialty: input.specialty ?? null,
    details: input.details,
    documents,
    reviewer_notes: null,
    reviewed_at: null,
    created_at: now(),
  };

  save((state) => {
    state.registrations.unshift(registration);
  });

  if (input.applicant_type === "patient" && input.password) {
    const exists = readStore().users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
    if (!exists) {
      const user: LocalUser = {
        id: crypto.randomUUID(),
        email: input.email,
        full_name: input.full_name ?? null,
        password: input.password,
        created_at: now(),
      };
      save((state) => {
        state.users.push(user);
        state.profiles.push({
          id: user.id,
          full_name: user.full_name,
          avatar_url: null,
          email: user.email,
          phone: input.phone ?? null,
          organization_name: null,
          user_type: "patient",
          created_at: user.created_at,
        });
        state.roles.push({ user_id: user.id, role: "user" });
      });
    }
  }

  return registration;
};

export const getDashboardStats = () => ({
  users: readStore().profiles.length,
  adverts: readStore().adverts.length,
  contacts: readStore().contacts.length,
  posts: readStore().posts.length,
  registrations: readStore().registrations.length,
  pendingRegistrations: countPendingRegistrations(),
});

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
