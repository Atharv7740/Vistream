import ShareButton from "@/components/atom/ShareButton";
import WishlistButton from "@/components/atom/WishlistButton";
import { buttonVariants } from "@/components/ui/button";
import { FilmIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = async ({ searchParams }) => {
  const params = await searchParams;
  const id = params.id;
  const poster_path = params.poster_path;

  try {
    // fetch details
    const response = await fetch(`http://localhost:3332/api/tv/details?id=${id}`, {
      cache: "no-store",
    });

    // handle bad response
    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const details = await response.json();
    const results = details?.data?.results || [];

    // check if results exist
    if (!results.length) throw new Error("No results found");

    const key = results[0]?.key;
    const name = results[0]?.name || "Untitled";

    return (
      <div className="mt-20">
        <iframe
          className="w-full aspect-video lg:h-[78vh]"
          src={`https://www.youtube.com/embed/${key}`}
          allowFullScreen
        />
        <div className="flex flex-wrap gap-4 px-4 lg:px-10 py-8 items-center">
          <h1 className="text-2xl font-bold">{name}</h1>
          <WishlistButton
            wishlist={{
              id,
              poster_path,
              name,
              media_type: details?.media_type || "tv",
              poster_path,
            }}
          />
          <ShareButton />
        </div>
      </div>
    );
  } catch (err) {
    // log internally (not shown to user)
    console.error("TV Watch Page Error:", err);

    // fallback UI — friendly message, no tech details
    return (
      <div className="w-full h-[60vh] flex flex-col gap-4 items-center justify-center text-slate-400">
        <FilmIcon className="w-[100px] h-[100px]" />
        <p>Uh oh! Something went wrong while loading this video.</p>
        <Link href={"/"} className={buttonVariants()}>
          Take me Home
        </Link>
      </div>
    );
  }
};

export default page;
