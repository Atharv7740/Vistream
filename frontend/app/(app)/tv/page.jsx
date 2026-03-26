import BannerSection from "@/components/section/BannerSection";
import CategoriesSection from "@/components/section/CategoriesSection";
import JumperSection from "@/components/section/JumperSection";
import {  ENDPOINT } from "@/lib/api.server";
import { safeFetch } from "@/lib/api.server";

export const dynamic = 'force-dynamic';

export default function Home() {
  const list = [
    {
      label: "Comedy",
      href: "comedy",
      fetcher: async () => {
        // Using ENDPOINT.fetchComedyTvShows
        return await safeFetch(ENDPOINT.fetchComedyTvShows);
      },
    },
    {
      label: "Crime",
      href: "crime",
      fetcher: async () => {
        // Using ENDPOINT.fetchCrimeTvShows
        return await safeFetch(ENDPOINT.fetchCrimeTvShows);
      },
    },
    {
      label: "Drama",
      href: "drama",
      fetcher: async () => {
        // Using ENDPOINT.fetchDramaTvShows
        return await safeFetch(ENDPOINT.fetchDramaTvShows);
      },
    },
    {
      label: "Action",
      href: "action",
      fetcher: async () => {
        // Using ENDPOINT.fetchActionTvShows
        return await safeFetch(ENDPOINT.fetchActionTvShows);
      },
    },
    // 1. Added Mystery TV Shows category
    {
      label: "Mystery",
      href: "mystery",
      fetcher: async () => {
        // Using ENDPOINT.fetchMysteryTvShows
        return await safeFetch(ENDPOINT.fetchMysteryTvShows);
      },
    },
  ];

  const getTVBannerData = async () => {
    // 2. Used a Discover endpoint (e.g., discoverNowPlaying or discoverTrending) for the banner
    return await safeFetch(ENDPOINT.fetchActionTvShows);
  };

  return (
    <>
      {/* Jumper section (for quick navigation) */}
      <JumperSection list={list} />
      {/* Banner section (e.g., Now Playing/Trending for the main feature) */}
      <BannerSection fetcher={getTVBannerData} />
      {/* // list of categories  */}
      {list.map((item) => {
        return (
          <CategoriesSection
            key={item.label}
            title={item.label}
            id={item.href}
            fetcher={item.fetcher}
          />
        );
      })}
    </>
  );
}
