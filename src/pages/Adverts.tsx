import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/data/blogs";
import { Search, Clock, ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { cn } from "@/lib/utils";

const ALL = "all";

const Adverts = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(ALL);

  const featured = useMemo(() => BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0], []);

  const filtered = useMemo(
    () =>
      BLOG_POSTS.filter((p) => p.id !== featured.id).filter((p) => {
        if (cat !== ALL && p.category !== cat) return false;
        if (q && !`${p.title} ${p.excerpt} ${p.author}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [q, cat, featured.id]
  );

  return (
    <SiteLayout>
      {/* Editorial masthead */}
      <section className="border-b border-border bg-muted/30">
        <div className="container py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <SectionLabel number="" label="The Journal" />
              <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold leading-[1.02] text-balance">
                Stories, Science &amp; Second Opinions.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Honest writing on health from doctors across Nigeria — the kind you'd hear in a
                clinic, not on a billboard.
              </p>
            </div>
            <div className="text-xs tracking-[0.2em] text-muted-foreground md:text-right">
              <p>Issue 04</p>
              <p className="mt-1">April 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured hero post */}
      <section className="container py-14">
        <article className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-muted aspect-[4/3] lg:aspect-[5/4]">
            <img
              src={featured.cover}
              alt={featured.title}
              width={1280}
              height={832}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
            <div className="absolute top-5 left-5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] px-3 py-1.5 rounded-full bg-background/95 backdrop-blur text-foreground border border-border">
                Featured · {featured.category}
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.2em] text-secondary font-semibold">
              {featured.date} · {featured.readTime}
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.1] text-balance">
              {featured.title}
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              {featured.excerpt}
            </p>
            <div className="mt-7 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-display font-semibold text-sm">
                {featured.author
                  .replace("Dr. ", "")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{featured.author}</p>
                <p className="text-xs text-muted-foreground">{featured.authorRole}</p>
              </div>
            </div>
            <Button variant="hero" size="lg" className="mt-8">
              Read the story <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </article>
      </section>

      {/* Filter bar */}
      <section className="border-y border-border bg-muted/20">
        <div className="container py-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCat(ALL)}
              className={cn(
                "text-xs tracking-wider font-semibold px-4 py-2 rounded-full border transition-colors",
                cat === ALL
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              )}
            >
              All Stories
            </button>
            {BLOG_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "text-xs tracking-wider font-semibold px-4 py-2 rounded-full border transition-colors",
                  cat === c
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the Journal…"
              className="pl-9 bg-background"
            />
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="container py-16">
        {filtered.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.id} className="group flex flex-col">
                <a
                  href="#"
                  className="relative overflow-hidden rounded-2xl bg-muted aspect-[4/5] block"
                >
                  <img
                    src={p.cover}
                    alt={p.title}
                    width={1280}
                    height={832}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] px-2.5 py-1 rounded-full bg-background/95 backdrop-blur text-foreground border border-border">
                    {p.category}
                  </span>
                </a>
                <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground tracking-wider">
                  <span>{p.date}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.readTime}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-[1.2] text-balance group-hover:text-secondary transition-colors">
                  <a href="#" className="inline-flex items-start gap-1.5">
                    {p.title}
                    <ArrowUpRight className="h-4 w-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {p.excerpt}
                </p>
                <p className="mt-5 pt-4 border-t border-border text-sm">
                  <span className="font-semibold">{p.author}</span>
                  <span className="text-muted-foreground"> · {p.authorRole}</span>
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-2xl border border-dashed border-border">
            <p className="font-display text-xl font-semibold">No Stories Yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try a different category or clear your search.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-16 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <SectionLabel number="" label="Subscribe" />
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight text-balance">
              The Journal, in Your Inbox Every Friday.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              One thoughtful read on health, written by a Nigerian doctor. No spam, unsubscribe
              anytime.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Adverts;
