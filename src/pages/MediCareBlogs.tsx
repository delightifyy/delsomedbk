import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Stethoscope, Search, Calendar, Clock, User } from "lucide-react";
import { useMediCareSettings } from "@/lib/medicareSettings";
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogPost } from "@/data/blogs";

const tokenStyles = `
.medicare-blogs {
  --mc-bg: 0 0% 100%;
  --mc-cream: 210 20% 96%;
  --mc-fg: 205 30% 20%;
  --mc-muted: 205 12% 42%;
  --mc-border: 205 18% 88%;
  --mc-sage: 205 30% 33%;
  --mc-sage-deep: 205 24% 37%;
  --mc-blue: 204 92% 51%;
  --mc-ink: 205 30% 20%;
  background: hsl(var(--mc-bg));
  color: hsl(var(--mc-fg));
  font-family: 'Inter', system-ui, sans-serif;
}
.medicare-blogs h1, .medicare-blogs h2, .medicare-blogs h3, .medicare-blogs h4 {
  font-family: 'Poppins', system-ui, sans-serif;
  letter-spacing: -0.01em;
  font-weight: 600;
}
.mb-chip {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 600;
  background: hsl(var(--mc-blue) / .12);
  color: hsl(var(--mc-sage));
}
.mb-card {
  background: white;
  border: 1px solid hsl(var(--mc-border));
  border-radius: 16px; overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease;
}
.mb-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px -16px hsl(var(--mc-sage) / .35); }
.mb-accent { color: hsl(var(--mc-sage)); }
`;

const MediCareBlogs = () => {
  const settings = useMediCareSettings();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    document.title = `Blogs — ${settings.siteName || "MediCare"}`;
  }, [settings.siteName]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (!q) return true;
      return (p.title + " " + p.excerpt + " " + p.author + " " + p.category)
        .toLowerCase().includes(q);
    });
  }, [query, activeCat]);

  const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
  const rest = filtered.filter((p) => p.id !== featured.id);

  return (
    <div className="medicare-blogs min-h-screen">
      <style>{tokenStyles}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[hsl(var(--mc-bg))]/90 backdrop-blur border-b border-[hsl(var(--mc-border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/doctor-portal" className="flex items-center gap-2 font-bold text-[hsl(var(--mc-ink))]">
            <Stethoscope className="h-5 w-5 mb-accent" />
            <span>{settings.siteName || "MediCare"}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[hsl(var(--mc-muted))]">
            <Link to="/doctor-portal" className="hover:text-[hsl(var(--mc-sage))]">Home</Link>
            <Link to="/doctor-portal#about" className="hover:text-[hsl(var(--mc-sage))]">About Us</Link>
            <Link to="/doctor-portal/services" className="hover:text-[hsl(var(--mc-sage))]">Services</Link>
            <Link to="/doctor-portal/blogs" className="mb-accent">Blogs</Link>
            <Link to="/doctor-portal#contact" className="hover:text-[hsl(var(--mc-sage))]">Contact Us</Link>
          </nav>
          <a href="/doctor-portal#cta" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--mc-sage))] text-white px-4 py-2 text-sm font-semibold hover:opacity-90">
            Book Appointment <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-10">
        <Link to="/doctor-portal" className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--mc-muted))] mb-5 hover:text-[hsl(var(--mc-sage))]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-end">
          <div>
            <span className="mb-chip mb-3">MediCare Journal</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl">
              Stories, insights & guidance from <span className="mb-accent">our clinicians</span>
            </h1>
            <p className="mt-4 max-w-xl text-[hsl(var(--mc-muted))] leading-relaxed">
              Evidence-based perspectives on wellness, nutrition, mental health, and modern care
              — written by the doctors you trust.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full border border-[hsl(var(--mc-border))] p-1.5 w-full md:w-auto md:min-w-[320px]">
            <div className="pl-3 text-[hsl(var(--mc-muted))]"><Search className="h-4 w-4" /></div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, authors..."
              className="flex-1 bg-transparent outline-none px-2 py-1.5 text-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--mc-muted))] hover:text-[hsl(var(--mc-sage))]">Clear</button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(["All", ...BLOG_CATEGORIES] as string[]).map((c) => {
            const active = activeCat === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active
                    ? "bg-[hsl(var(--mc-sage))] text-white border-[hsl(var(--mc-sage))]"
                    : "bg-white text-[hsl(var(--mc-muted))] border-[hsl(var(--mc-border))] hover:text-[hsl(var(--mc-sage))]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      {activeCat === "All" && !query && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <Link to={`/health-news/${featured.slug}`} className="block mb-card group">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-[hsl(var(--mc-cream))]">
                <img src={featured.cover} alt={featured.title} loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="mb-chip mb-3 w-fit">Featured · {featured.category}</span>
                <h2 className="text-2xl sm:text-3xl leading-snug mb-3">{featured.title}</h2>
                <p className="text-[hsl(var(--mc-muted))] leading-relaxed mb-5">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-[hsl(var(--mc-muted))]">
                  <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{featured.author}</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{featured.date}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold mb-accent">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl">
            {activeCat === "All" ? "Latest articles" : activeCat}
          </h2>
          <span className="text-xs text-[hsl(var(--mc-muted))]">{rest.length} article{rest.length !== 1 ? "s" : ""}</span>
        </div>

        {rest.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--mc-border))] p-16 text-center bg-white">
            <p className="text-[hsl(var(--mc-muted))]">No articles match your filters.</p>
            <button
              onClick={() => { setQuery(""); setActiveCat("All"); }}
              className="mt-3 text-sm font-semibold mb-accent"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((p: BlogPost) => (
              <Link key={p.id} to={`/health-news/${p.slug}`} className="mb-card group flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-[hsl(var(--mc-cream))]">
                  <img src={p.cover} alt={p.title} loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="mb-chip w-fit mb-3">{p.category}</span>
                  <h3 className="text-lg leading-snug mb-2 group-hover:text-[hsl(var(--mc-sage))] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--mc-muted))] leading-relaxed line-clamp-3 mb-5">
                    {p.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs text-[hsl(var(--mc-muted))]">
                    <span className="font-medium text-[hsl(var(--mc-ink))]">{p.author}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{p.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>




      {/* Footer */}
      <footer className="bg-[hsl(var(--mc-sage-deep))] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-1 text-sm">
            <Link to="/doctor-portal" className="block hover:underline">Home</Link>
            <Link to="/doctor-portal/services" className="block hover:underline">Services</Link>
            <Link to="/doctor-portal/blogs" className="block hover:underline">Blogs</Link>
            <Link to="/doctor-portal#contact" className="block hover:underline">Contact Us</Link>
          </div>
          <div className="sm:text-right">
            <div className="flex sm:justify-end items-center gap-2 font-bold text-lg">
              <Stethoscope className="h-5 w-5" /> {settings.siteName || "MediCare"}
            </div>
            <p className="text-sm text-white/85 mt-2">Supporting your path to wellness</p>
          </div>
        </div>
        <div className="bg-[hsl(var(--mc-ink))] text-white/70 text-xs py-4 text-center">
          © {new Date().getFullYear()} MediCare. All rights reserved In Partnership With Desolmedical Solution Limited.
        </div>
      </footer>
    </div>
  );
};

export default MediCareBlogs;
