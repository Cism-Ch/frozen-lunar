import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hbc-logistique.fr";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/about", "/services", "/devis", "/contact", "/legal/"],
                disallow: ["/admin/", "/api/", "/_next/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
