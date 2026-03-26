import BannerSection from "@/components/section/BannerSection";
import CategoriesSection from "@/components/section/CategoriesSection";
import JumperSection from "@/components/section/JumperSection";
import { ENDPOINT } from "@/lib/api.server";
import { safeFetch } from "@/lib/api.server";

export const dynamic = 'force-dynamic';

export default function Home() {
    const list = [
        {
            label: "Top Comedy Movies",
            href: "comedy",
            fetcher: async () => safeFetch(ENDPOINT.fetchComedyMovies)
        },
        {
            label: "Top Horror Movies",
            href: "horror",
            fetcher: async () => safeFetch(ENDPOINT.fetchHorrorMovies)
        },
        {
            label: "Top Romance Movies",
            href: "romance",
            fetcher: async () => safeFetch(ENDPOINT.fetchRomanceMovies)
        },
        {
            label: "Top Action Movies",
            href: "action",
            fetcher: async () => safeFetch(ENDPOINT.fetchActionMovies)
        },
    ];
    const getMoviesBannerData = async () => {
        return await safeFetch(ENDPOINT.fetchAnimeMovies)
    };

    return (
        <>
            <JumperSection list={list} />
            <BannerSection fetcher={getMoviesBannerData} />
            {/* // list of categories  */}
            {list.map((item) => {
                return <CategoriesSection key={item.label} title={item.label} id={item.href} fetcher={item.fetcher} />
            })}
        </>
    );
}