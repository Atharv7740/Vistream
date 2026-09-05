import Image from "next/image";
import Link from "next/link";
import { ENDPOINT, getWatchUrl, media, safeFetch } from "@/lib/api.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.query?.trim() || "";
  const results = query ? await safeFetch(ENDPOINT.search(query)) : [];

  return (
    <main className="min-h-screen bg-[#0d0e10] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c1a362]">
            Search
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            {query ? `Results for "${query}"` : "Search Vistream"}
          </h1>
        </div>

        {results === null && (
          <div className="flex min-h-[40vh] items-center justify-center text-red-400">
            Failed to load search results. Please try again.
          </div>
        )}

        {results !== null && query && results.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
            No movies or TV shows found.
          </div>
        )}

        {results !== null && !query && (
          <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
            Type a title in the search box above.
          </div>
        )}

        {results && results.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => (
              <Link
                key={`${item.media_type}-${item.id}`}
                href={getWatchUrl(item.id, item.media_type, item.poster_path)}
                className="group"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
                  <Image
                    src={media(item.poster_path)}
                    alt={item.title || item.name || "Search result"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    quality={45}
                  />
                </div>
                <div className="mt-3">
                  <h2 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-[#c1a362]">
                    {item.title || item.name}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                    {item.media_type === "tv" ? "TV Show" : "Movie"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
