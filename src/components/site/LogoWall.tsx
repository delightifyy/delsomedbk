import { PARTNERS } from "@/data/partners";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export const LogoWall = () => {
  const plugin = useRef(Autoplay({ delay: 2500, stopOnInteraction: false }));

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[plugin.current]}
      className="w-full"
    >
      <CarouselContent className="-ml-px">
        {PARTNERS.map((p) => (
          <CarouselItem
            key={p.name}
            className="pl-px basis-1/2 sm:basis-1/4 lg:basis-1/6"
          >
            <div className="bg-card grid place-items-center h-20 px-4 border border-border rounded-lg grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
              <span className="font-display text-sm font-bold text-muted-foreground tracking-tight text-center leading-tight">
                {p.name}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
};
