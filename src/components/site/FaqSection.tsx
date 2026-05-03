import { FAQS } from "@/data/faqs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const FaqSection = () => {
  const half = Math.ceil(FAQS.length / 2);
  const cols = [FAQS.slice(0, half), FAQS.slice(half)];

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
