import BannerSection from "@/components/section/BannerSection";
import CategoriesSection from "@/components/section/CategoriesSection";
import JumperSection from "@/components/section/JumperSection";
import { api, ENDPOINT,  } from "@/lib/api.server";

import { safeFetch } from "@/lib/api.server";

export const dynamic = 'force-dynamic';

export default function Home() {
  const list = [
    {
      label: "Top Rated",
      href: "top-rated",
      fetcher:async function getTopRatedData() {
      return await safeFetch(ENDPOINT.discoverTopRated)
    }
    },
    {
      label: "Popular",
      href: "popular",
      fetcher:async function getPopular(){
        return await safeFetch(ENDPOINT.discoverTrending)
      }
    },
    {
      label: "Upcoming",
      href: "upcoming",
      fetcher: async function getUpcoming() {
        return await safeFetch(ENDPOINT.discoverUpcoming)
        
      }
    },
  ];
   async function getHomeBannerData() {
    return await safeFetch(ENDPOINT.discoverNowPlaying)
  }

  return (
    
    <>
    <JumperSection list={list}/>
      <BannerSection fetcher={getHomeBannerData}/>
    {/* // list of categories  */}
      {list.map((item) => {
        return <CategoriesSection key={item.label} title={item.label} id={item.href} fetcher={item.fetcher} />
      })}
    </>
  );
}