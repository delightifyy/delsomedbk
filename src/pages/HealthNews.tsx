import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { type LocalNewsArticle } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, newsArticleFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

const HealthNews = () => {
  const [items, setItems] = useState<LocalNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await api.posts.list({ type: "news" });
        const mapped = collection(response.data).map(newsArticleFromApi).filter((entry) => entry.published);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container py-14 sm:py-20">
          <div className="max-w-2xl space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-primary">
              <Newspaper className="h-4 w-4" /> Health News
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
              The Latest in Healthcare, Research and Policy.
            </h1>
            <p className="text-muted-foreground">
              Curated updates from trusted sources — keeping patients, doctors and partners informed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-7 w-11/12" />
                    <Skeleton className="h-7 w-2/3" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-28" />
                  </CardContent>
                </Card>
              ))
            ) : items.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No news has been published from the backend yet.
              </div>
            ) : items.map((n) => (
              <Link key={n.slug} to={`/health-news/${n.slug}`} className="group">
                <Card className="h-full overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                  {n.cover_image && (
                    <div className="aspect-[16/9] bg-muted overflow-hidden">
                      <img
                        src={n.cover_image}
                        alt={n.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{n.category}</Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {n.date}
                      </span>
                    </div>
                    <CardTitle className="font-display text-xl leading-snug group-hover:text-primary transition-colors">
                      {n.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read full story <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default HealthNews;
