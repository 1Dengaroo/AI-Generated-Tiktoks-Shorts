import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/create", "/clips"],
      },
    ],
    sitemap: "https://rshorts.app/sitemap.xml",
  };
}
