import React, { Suspense } from "react";
import { Skeleton } from "../atom/Skeleton";
import { getWatchUrl, media } from "@/lib/api.server";
import Image from "next/image";
import { InboxIcon } from "lucide-react";
import Link from "next/link";

/**
 * CategoriesSection
 * Generic section to display a list of items (movies, TV shows, watchlist, etc.)
 * Props:
 * - title: section title
 * - id: HTML id for anchor links
 * - fetcher: async function to fetch list of items
 * - renderItem: optional function to render each item (item) => ReactNode
 */
function CategoriesSection({ title, id, fetcher, renderItem }) {
  return (
    <div className="py-8 px-6">
      <h2 id={id} className="text-2xl font-medium mb-6 scroll-m-[100px]">
        {title}
      </h2>
      <Suspense fallback={<CategoriesFallback />}>
        <CategoriesContent fetcher={fetcher} renderItem={renderItem} />
      </Suspense>
    </div>
  );
}

async function CategoriesContent({ fetcher, renderItem }) {
  const data = await fetcher();

  // null = fetch error, [] = empty data
  if (data === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[300px] py-12">
        <InboxIcon className="w-32 h-32 text-red-400 mb-10" strokeWidth={1.2} />
        <p className="text-lg text-red-500">Failed to load. Please refresh.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[300px] py-12">
        <InboxIcon
          className="w-32 h-32 text-slate-400 mb-10"
          strokeWidth={1.2}
        />
        <p className="text-lg text-gray-500">No items found.</p>
      </div>
    );
  }

  return (
    <ul
      className="flex gap-4 w-full overflow-scroll scrollbar-hide hide-scrollbar"
      style={{
        // Inline fallback for broader compatibility
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {data.map((post) => (
        <li key={post.id} className="relative shrink-0">
          {" "}
          {/* Added shrink-0 to prevent item compression */}
          {renderItem ? (
            renderItem(post)
          ) : (
            <Link
              href={getWatchUrl(post.id, post.media_type, post?.poster_path)}
            >
              <Image
                src={media(post?.poster_path)}
                alt={post.name || ""}
                width={200}
                height={300}
                className="min-w-[200px] h-[300px] rounded-lg object-cover"
                quality={30}
              />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * CategoriesFallback
 * Shows skeleton loader while fetching
 */
export function CategoriesFallback() {
  return (
    <ul
      className="flex gap-4 w-full overflow-scroll scrollbar-hide hide-scrollbar"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {new Array(12).fill(0).map((_, index) => (
        <Skeleton key={index} className="min-w-[200px] h-[300px] shrink-0" />
      ))}
    </ul>
  );
}

export default CategoriesSection;
