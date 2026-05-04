import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listAdverts, subscribeStore, type LocalAdvert } from "@/lib/localStore";

const AdvertArticle = () => {
  const { id } = useParams();
  const [items, setItems] = useState<LocalAdvert[]>([]);

  useEffect(() => subscribeStore(() => setItems(listAdverts().filter((a) => a.published))), []);

  const advert = useMemo(() => items.find((a) => a.id === id), [items, id]);

  if (!advert) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container py-20 text-center space-y-4">
          <h1 className="font-display text-3xl font-bold">Advert not found</h1>
          <p className="text-muted-foreground">This advert may have been removed or is unpublished.</p>
          <Button asChild variant="outline">
            <Link to="/adverts"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Adverts</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-14 max-w-3xl">
        <Link to="/adverts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Adverts
        </Link>

        <div className="space-y-4 mb-8">
          <Badge variant="secondary">{advert.category}</Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">{advert.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {new Date(advert.created_at || Date.now()).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">{advert.sponsor} · {advert.city}, {advert.state}</span>
          </div>
        </div>

        <p className="text-lg text-foreground/90 leading-relaxed mb-6">{advert.description}</p>

        {/* CTA removed per request */}
      </main>
      <SiteFooter />
    </div>
  );
};

export default AdvertArticle;
