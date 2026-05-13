import { useEffect, useState } from "react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { type LocalFaq } from "@/lib/localStore";
import { api } from "@/lib/api";
import { collection, faqFromApi } from "@/lib/backendAdapters";
import { Skeleton } from "@/components/ui/skeleton";

export const FaqSection = () => {
  const [faqs, setFaqs] = useState<LocalFaq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadFaqs = async () => {
      setLoading(true);
      try {
        const response = await api.cms.faqs();
        const mapped = collection(response.data).map(faqFromApi);
        if (!cancelled) setFaqs(mapped);
      } catch {
        if (!cancelled) setFaqs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadFaqs();
    return () => {
      cancelled = true;
    };
  }, []);

  const half = Math.ceil(faqs.length / 2);
  const cols = [faqs.slice(0, half), faqs.slice(half)];

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="space-y-5">
            {Array.from({ length: 4 }).map((__, row) => (
              <div key={row} className="border-b border-border pb-5">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="mt-3 h-4 w-2/3" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return <p className="text-sm text-muted-foreground">No FAQs yet.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
      {cols.map((col, ci) => (
        <Accordion key={ci} type="single" collapsible className="w-full">
          {col.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${ci}-${i}`} className="border-b border-border">
              <AccordionTrigger className="font-display text-left text-base font-semibold hover:no-underline hover:text-primary py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ))}
    </div>
  );
};
