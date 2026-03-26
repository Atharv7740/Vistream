
import ShareButton from "@/components/atom/ShareButton";
import WishlistButton from "@/components/atom/WishlistButton";
import { buttonVariants } from "@/components/ui/button";
// import { api, ENDPOINT } from "@/lib/api";
// import { safeFetch } from "@/lib/api.server";
import { FilmIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = async ({ searchParams }) => {
  const params = await searchParams;
  const id = params.id;
  const poster_path = params.poster_path;
  
    const response= await fetch(`http://localhost:3332/api/movies/details?id=${id}`);
    const details = await response.json()
    const results = details.data.results;
    const key = results[0].key
    // console.log("data",results)
    // console.log("key",key);
    
   
    

    return (
        <div className="mt-20">
            {details ? (
                <>
                    {/* show youtube  */}
                    <iframe
                        className="w-full aspect-video lg:h-[78vh]"
                        src={`https://www.youtube.com/embed/${details.data.results[0].key}`}
                    />
                    <div className="flex flex-wrap gap-4 px-4 lg:px-10 py-8 items-center">
                        <h1 className="text-2xl font-bold">{details.data.results[0].name}</h1>
                        <WishlistButton
                            wishlist={{
                                id: id,
                                poster_path: poster_path,
                                name: details.data.results[0].name,
                                media_type: details.media_type || "movie",
                        
                            }}
                        />
                        <ShareButton />
                    </div>
                </>
            ) : (
                // show error
                <div className="w-full h-[60vh] flex flex-col gap-4 items-center justify-center text-slate-400">
                    <FilmIcon className="w-[100px] h-[100px]" />
                    <p>Uh Oh! Video is unavailable.</p>
                    <Link href={"/"} className={buttonVariants()}>
                        Take me Home
                    </Link>
                </div>
            )}
        </div>
    )

}

export default page;