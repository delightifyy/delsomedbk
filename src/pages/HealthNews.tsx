import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { NEWS } from "@/data/news";

const HealthNews = () => {
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
            {NEWS.map((n) => (
              <Link key={n.slug} to={`/health-news/${n.slug}`} className="group">
                <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all">
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
