import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { type LocalTestimonial } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, testimonialFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

export const Testimonials = () => {
  const [items, setItems] = useState<LocalTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadTestimonials = async () => {
      setLoading(true);
      try {
        const response = await api.cms.testimonials();
        const mapped = collection(response.data).map(testimonialFromApi).filter((entry) => entry.published);
        if (!cancelled) setItems(mapped);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadTestimonials();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-8">
            <Skeleton className="ml-auto h-8 w-8 rounded-full" />
            <Skeleton className="mt-4 h-5 w-5/6" />
            <Skeleton className="mt-3 h-5 w-3/4" />
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No testimonials yet.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {items.map((t, i) => (
        <figure
          key={t.id}
          className={`relative rounded-2xl border border-border bg-card p-8 ${
            i % 2 === 0 ? "" : "md:translate-y-6"
          }`}
        >
          <Quote className="absolute top-6 right-6 h-8 w-8 text-secondary/20 mx-0" />
          <blockquote className="font-display text-lg leading-relaxed text-foreground">
            "{t.quote}"
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary font-display font-bold text-sm">
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.name} className="h-full w-full rounded-full object-cover" loading="lazy" />
              ) : (
                t.initials
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
};
