import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import { api, resolveApiAssetUrl } from "@/lib/api";
import { collection } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

type Partner = {
  name: string;
  logoUrl: string;
};

const partnerFromApi = (entry: any): Partner => ({
  name: String(entry?.name ?? entry?.title ?? entry?.organization_name ?? "Partner"),
  logoUrl: resolveApiAssetUrl(entry?.logo_url ?? entry?.logo ?? entry?.image_url ?? entry?.image ?? ""),
});

export const LogoWall = () => {
  const plugin = useRef(Autoplay({ delay: 2500, stopOnInteraction: false }));
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadPartners = async () => {
      setLoading(true);
      try {
        const response = await api.cms.partners();
        const mapped = collection(response.data).map(partnerFromApi);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPartners();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[plugin.current]}
      className="w-full"
    >
      <CarouselContent className="-ml-px">
        {loading ? Array.from({ length: 6 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="pl-px basis-1/2 sm:basis-1/4 lg:basis-1/6"
          >
            <div className="bg-card grid place-items-center h-20 px-4 border border-border rounded-lg">
              <Skeleton className="h-4 w-24" />
            </div>
          </CarouselItem>
        )) : items.map((p) => (
          <CarouselItem
            key={p.name}
            className="pl-px basis-1/2 sm:basis-1/4 lg:basis-1/6"
          >
            <div className="bg-card grid place-items-center h-20 px-4 border border-border rounded-lg grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.name} className="max-h-10 max-w-full object-contain" loading="lazy" />
              ) : (
                <span className="font-display text-sm font-bold text-muted-foreground tracking-tight text-center leading-tight">
                  {p.name}
                </span>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
};
