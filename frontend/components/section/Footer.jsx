import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";

const footerLinks = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "TV Shows", href: "/tv" },
    { label: "Watchlist", href: "/watchlist" },
    { label: "Vi+", href: "/vs+" },
];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#080808] text-gray-300">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[1.4fr_0.9fr_1fr] md:items-start">
                <div className="max-w-xl">
                    <h2 className="text-2xl font-bold tracking-wide text-white">VISTREAM</h2>
                    <p className="mt-3 text-sm leading-6 text-gray-400">
                        Streaming platform with authenticated media access,
                        watchlists, subscription payments, and admin-managed premium content.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c1a362]">
                        Explore
                    </h3>
                    <nav className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-medium" aria-label="Footer navigation">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 transition-colors hover:text-[#c1a362]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c1a362]">
                        Platform
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-gray-400">
                        Secure auth, subscription lifecycle, content administration,
                        and protected video streaming.
                    </p>
                    <Link
                        href="https://github.com/Atharv7740/Vistream"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#c1a362] transition-colors hover:text-white"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Github className="h-4 w-4" />
                        Source code
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
