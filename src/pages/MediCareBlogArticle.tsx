import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { BLOG_POSTS, type BlogPost } from "@/data/blogs";
import { supabase } from "@/integrations/supabase/client";
import { useMediCareSettings } from "@/lib/medicareSettings";
import { MedicareFooter, MedicareSimpleHeader, medicareThemeStyle } from "@/components/medicare/MediCareChrome";
import { api, resolveApiAssetUrl } from "@/lib/api";

type Article = BlogPost & {
  content?: string;
};

const tokenStyles = `
.medicare-blog-article {
  --mc-primary: 212 88% 32%;
  --mc-accent: 174 72% 42%;
  --mc-bg: 210 40% 99%;
  --mc-fg: 222 47% 11%;
  --mc-muted: 215 16% 47%;
  --mc-border: 215 25% 90%;
  --mc-card: 0 0% 100%;
  --mc-ink: 222 47% 11%;
  background: hsl(var(--mc-bg));
  color: hsl(var(--mc-fg));
  font-family: 'Inter', system-ui, sans-serif;
}
.medicare-blog-article h1, .medicare-blog-article h2, .medicare-blog-article h3 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: -0.01em;
}
`;

const splitContent = (content?: string) =>
  (content || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};

const text = (value: unknown, fallback = "") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  const record = asRecord(value);
  return String(record.name ?? record.title ?? record.label ?? fallback);
};

const dateLabel = (value: unknown) => {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
};

const normalizeMiniSiteArticle = (value: unknown): Article => {
  const row = asRecord(value);
  const category = row.category ?? row.post_category;
  const minutes = Number(row.read_time_minutes ?? row.readTimeMinutes);
  return {
    id: text(row.id ?? row.uuid ?? row.slug, crypto.randomUUID()),
    slug: text(row.slug ?? row.id ?? row.uuid, crypto.randomUUID()),
    title: text(row.title, "Untitled article"),
    excerpt: text(row.excerpt ?? row.summary ?? row.description),
    content: text(row.content ?? row.body),
    category: (text(category, "Wellness") as BlogPost["category"]) || "Wellness",
    author: text(row.author_name ?? row.author?.name, "MediCare Team"),
    authorRole: text(row.author_role ?? row.author?.role),
    date: dateLabel(row.published_at ?? row.publish_date ?? row.created_at),
    readTime: Number.isFinite(minutes) && minutes > 0 ? `${minutes} min read` : text(row.read_time, "5 min read"),
    cover: resolveApiAssetUrl(text(row.cover_image_url ?? row.cover_image ?? row.image_url ?? row.hero_image_url)),
    featured: row.is_featured === true || row.featured === true,
  };
};

const MediCareBlogArticle = ({ doctorSlug }: { doctorSlug?: string } = {}) => {
  const { slug, postSlug } = useParams();
  const articleSlug = slug || postSlug || "";
  const settings = useMediCareSettings(doctorSlug);
  const basePath = doctorSlug ? "" : "/doctor-portal";
  const blogsHref = `${basePath}/blogs` || "/blogs";
  const themeStyle = useMemo(
    () => medicareThemeStyle(settings),
    [settings.primaryColor, settings.accentColor],
  );
  const [article, setArticle] = useState<Article | null>(() => BLOG_POSTS.find((post) => post.slug === articleSlug) ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (doctorSlug && articleSlug) {
        try {
          const response = await api.medicare.public.post(doctorSlug, articleSlug);
          if (!cancelled) setArticle(normalizeMiniSiteArticle(response.data));
        } catch {
          if (!cancelled) setArticle(null);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, content, cover_image, category, author_name, author_role, read_time, featured, publish_date, published")
        .eq("slug", articleSlug)
        .eq("published", true)
        .maybeSingle();

      if (cancelled) return;
      if (data) {
        setArticle({
          id: data.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt ?? "",
          content: data.content ?? "",
          category: (data.category as BlogPost["category"]) ?? "Wellness",
          author: data.author_name ?? "MediCare Team",
          authorRole: data.author_role ?? "",
          date: data.publish_date ? new Date(data.publish_date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "",
          readTime: data.read_time ?? "5 min read",
          cover: data.cover_image ?? "",
          featured: !!data.featured,
        });
      } else {
        setArticle(BLOG_POSTS.find((post) => post.slug === articleSlug) ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [articleSlug, doctorSlug]);

  useEffect(() => {
    document.title = article ? `${article.title} - ${settings.siteName || "MediCare"}` : `Blog - ${settings.siteName || "MediCare"}`;
  }, [article, settings.siteName]);

  const body = splitContent(article?.content);
  const fallbackBody = article?.excerpt ? [article.excerpt] : [];
  const paragraphs = body.length ? body : fallbackBody;
  const related = BLOG_POSTS.filter((post) => post.slug !== article?.slug).slice(0, 2);

  return (
    <div className="medicare-blog-article min-h-screen" style={themeStyle}>
      <style>{tokenStyles}</style>
      <MedicareSimpleHeader settings={settings} activeHref={blogsHref} basePath={basePath} />

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Link to={blogsHref} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--mc-muted))] transition hover:text-[hsl(var(--mc-primary))]">
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="h-5 w-24 animate-pulse rounded-full bg-[hsl(var(--mc-border))]" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-[hsl(var(--mc-border))]" />
            <div className="h-12 w-4/5 animate-pulse rounded-xl bg-[hsl(var(--mc-border))]" />
            <div className="mt-8 h-72 animate-pulse rounded-3xl bg-[hsl(var(--mc-border))]" />
          </div>
        ) : !article ? (
          <section className="rounded-3xl border border-dashed border-[hsl(var(--mc-border))] bg-white p-12 text-center">
            <h1 className="font-display text-3xl font-bold">Article not found</h1>
            <p className="mt-3 text-[hsl(var(--mc-muted))]">This story may have been moved or removed.</p>
          </section>
        ) : (
          <article>
            <span className="inline-flex rounded-full bg-[hsl(var(--mc-accent)/.14)] px-3 py-1 text-xs font-semibold text-[hsl(var(--mc-primary))]">
              {article.category}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-6xl">
              {article.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--mc-muted))]">
              <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />{article.author}</span>
              {article.date && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{article.date}</span>}
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.readTime}</span>
            </div>

            {article.cover && (
              <div className="mt-9 overflow-hidden rounded-3xl bg-[hsl(var(--mc-border))]">
                <img src={article.cover} alt={article.title} className="aspect-[16/9] h-full w-full object-cover" />
              </div>
            )}

            <div className="mt-10 space-y-6 text-lg leading-relaxed text-[hsl(var(--mc-fg)/.86)]">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {related.length > 0 && (
              <section className="mt-16 border-t border-[hsl(var(--mc-border))] pt-10">
                <h2 className="font-display text-2xl font-bold">More stories</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {related.map((post) => (
                    <Link
                      key={post.slug}
                      to={`${blogsHref}/${post.slug}`}
                      className="rounded-2xl border border-[hsl(var(--mc-border))] bg-white p-5 transition hover:border-[hsl(var(--mc-primary)/.45)] hover:shadow-[0_18px_40px_-30px_hsl(var(--mc-primary)/.45)]"
                    >
                      <span className="text-xs font-semibold text-[hsl(var(--mc-primary))]">{post.category}</span>
                      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{post.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </main>

      <MedicareFooter settings={settings} basePath={basePath} />
    </div>
  );
};

export default MediCareBlogArticle;
