import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listNewsArticles, subscribeStore, type LocalNewsArticle } from "@/lib/localStore";

const HealthNewsArticle = () => {
  const { slug } = useParams();
  const [items, setItems] = useState<LocalNewsArticle[]>([]);

  useEffect(
    () => subscribeStore(() => setItems(listNewsArticles().filter((entry) => entry.published))),
    []
  );

  const article = useMemo(() => items.find((n) => n.slug === slug), [items, slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container py-20 text-center space-y-4">
          <h1 className="font-display text-3xl font-bold">Article not found</h1>
          <p className="text-muted-foreground">This story may have been moved or removed.</p>
          <Button asChild variant="outline">
            <Link to="/health-news"><ArrowLeft className="h-4 w-4 mr-1" /> Back to News</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const related = items.filter((n) => n.slug !== article.slug).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="container py-14 sm:py-20 max-w-3xl">
          <Link to="/health-news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to News
          </Link>

          <div className="space-y-4 mb-8">
            <Badge variant="secondary">{article.category}</Badge>
            <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {article.date}
              </span>
              {article.author && (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {article.author}
                </span>
              )}
            </div>
          </div>

          <p className="text-lg text-foreground/90 leading-relaxed mb-6 font-medium">
            {article.excerpt}
          </p>

          <div className="space-y-5 text-base text-foreground/85 leading-relaxed">
            {article.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border">
              <h2 className="font-display text-xl font-bold mb-5">More stories</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/health-news/${r.slug}`}
                    className="block p-4 rounded-lg border border-border hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <Badge variant="secondary" className="mb-2">{r.category}</Badge>
                    <h3 className="font-display font-semibold leading-snug hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};

export default HealthNewsArticle;
