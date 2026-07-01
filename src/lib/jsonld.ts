import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "./site";

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512` },
};

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

type Crumb = { name: string; url: string };

function breadcrumb(items: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  crumbs: Crumb[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: opts.title,
        ...(opts.description ? { description: opts.description } : {}),
        url: opts.url,
        mainEntityOfPage: opts.url,
        ...(opts.image ? { image: opts.image } : {}),
        ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
        ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
        author: publisher,
        publisher,
      },
      breadcrumb(opts.crumbs),
    ],
  };
}
