import { getWatchUrl, media } from "@/lib/api.server";
import React, { Suspense } from "react";
import { Skeleton } from "../atom/Skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { InboxIcon } from "lucide-react";

async function BannerSection({ fetcher }) {
  return (
    <Suspense fallback={<BannerSectionFallback />}>
      <BannerSectionContent fetcher={fetcher} />
    </Suspense>
  );
}

async function BannerSectionContent({ fetcher }) {
  const data = await fetcher();
  const bannerItems = (data || []).filter(
    (vid) => vid?.backdrop_path || vid?.poster_path,
  );

  if (bannerItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[360px] py-12">
        <InboxIcon
          className="w-32 h-32 text-slate-400 mb-10"
          strokeWidth={1.2}
        />
        <p className="text-lg text-gray-500">No items found.</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      className="w-full px-4 md:px-8"
    >
      <CarouselContent>
        {bannerItems.map((vid) => {
          const imagePath = vid.backdrop_path || vid.poster_path;
          const isBackdrop = Boolean(vid.backdrop_path);
          const title = vid.title || vid.name || "Featured title";

          return (
            <CarouselItem
              key={vid.id}
              className="basis-[88%] md:basis-[58%] xl:basis-[46%]"
            >
              <Link
                href={getWatchUrl(vid.id, vid.media_type, vid?.poster_path)}
                className="block"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[#15171b]">
                  <Image
                    src={media(imagePath)}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 88vw, (max-width: 1280px) 58vw, 46vw"
                    className={`bg-[#15171b] ${
                      isBackdrop
                        ? "object-cover object-center"
                        : "object-contain"
                    }`}
                    quality={45}
                  />
                </div>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="absolute bottom-6 right-[10%] hidden items-center gap-3 md:flex">
        <CarouselPrevious className="static h-11 w-11 translate-x-0 translate-y-0 border border-white/20 bg-black/70 text-white shadow-none backdrop-blur-md hover:bg-[#c1a362] hover:text-black disabled:opacity-40" />
        <CarouselNext className="static h-11 w-11 translate-x-0 translate-y-0 border border-white/20 bg-black/70 text-white shadow-none backdrop-blur-md hover:bg-[#c1a362] hover:text-black disabled:opacity-40" />
      </div>
    </Carousel>
  );
}

function BannerSectionFallback() {
  return (
    <div className="flex items-center gap-4 overflow-hidden px-4 md:px-8">
      <Skeleton className="aspect-[16/9] w-[88vw] shrink-0 rounded-lg md:w-[58vw] xl:w-[46vw]" />
      <Skeleton className="aspect-[16/9] w-[88vw] shrink-0 rounded-lg md:w-[58vw] xl:w-[46vw]" />
      <Skeleton className="aspect-[16/9] w-[88vw] shrink-0 rounded-lg md:w-[58vw] xl:w-[46vw]" />
    </div>
  );
}

export default BannerSection;
