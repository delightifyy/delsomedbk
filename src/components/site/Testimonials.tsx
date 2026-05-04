import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { listTestimonials, subscribeStore, type LocalTestimonial } from "@/lib/localStore";

export const Testimonials = () => {
  const [items, setItems] = useState<LocalTestimonial[]>([]);

  useEffect(
    () => subscribeStore(() => setItems(listTestimonials().filter((entry) => entry.published))),
    []
  );

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
              {t.initials}
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
