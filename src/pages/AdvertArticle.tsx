import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type LocalAdvert } from "@/lib/localStore";
import { api } from "@/lib/api";
import { advertFromApi, collection } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

const AdvertArticle = () => {
  const { id } = useParams();
  const [items, setItems] = useState<LocalAdvert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadAdvert = async () => {
      setLoading(true);
      try {
        const [listResponse, detailResponse] = await Promise.all([
          api.adverts.list(),
          id ? api.adverts.detail(id) : Promise.resolve(null),
        ]);
        const list = collection(listResponse.data).map(advertFromApi).filter((entry) => entry.published);
        const detail = detailResponse ? advertFromApi(detailResponse.data) : null;
        const next = detail ? [detail, ...list.filter((entry) => entry.id !== detail.id)] : list;
        if (!cancelled) setItems(next);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadAdvert();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const advert = useMemo(() => items.find((a) => a.id === id), [items, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container py-14 max-w-3xl">
          <Skeleton className="mb-6 h-5 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="mt-5 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-4/5" />
          <div className="mt-5 flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="mt-10 space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

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

        {advert.image && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-muted aspect-[16/9]">
            <img src={advert.image} alt={advert.title} className="h-full w-full object-cover" />
          </div>
        )}

        <p className="text-lg text-foreground/90 leading-relaxed mb-6">{advert.description}</p>

        {/* CTA removed per request */}
      </main>
      <SiteFooter />
    </div>
  );
};

export default AdvertArticle;
