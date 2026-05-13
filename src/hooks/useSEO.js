/**
 * useSEO.js
 * Dynamic SEO meta tag manager for Naidu Gari Ruchulu
 * Manages: title, description, canonical, OG, Twitter cards, JSON-LD
 */

import { useEffect } from "react";

const SITE_NAME = "Naidu Gari Ruchulu";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://naidugariruchulu.vercel.app";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.webp`;
const DEFAULT_DESCRIPTION =
  "Authentic Andhra homemade pickles, sweets, snacks & podis — Avakaya, Chicken Pickle, Gongura, Prawns Pickle & more. Fresh, preservative-free. Pan-India delivery.";

/**
 * Inject or update a <meta> tag by name or property.
 */
function setMeta(attrName, attrValue, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Inject or update a <link> tag by rel.
 */
function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Inject or update JSON-LD script tag with a given id.
 */
function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Remove a JSON-LD script tag by id.
 */
function removeJsonLd(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * Main SEO hook.
 *
 * @param {object} options
 * @param {string}  options.title          - Page title (will be suffixed with site name)
 * @param {string}  options.description    - Meta description
 * @param {string}  [options.canonical]    - Canonical URL (defaults to current page)
 * @param {string}  [options.image]        - OG image URL
 * @param {string}  [options.type]         - OG type: "website" | "product" (default: "website")
 * @param {string}  [options.robots]       - robots meta content (default: "index,follow")
 * @param {object}  [options.product]      - Product data for Product schema
 * @param {object}  [options.breadcrumbs]  - Array of {name, url} for BreadcrumbList
 * @param {object}  [options.faqItems]     - Array of {question, answer} for FAQPage schema
 * @param {boolean} [options.noIndex]      - If true, sets noindex,nofollow
 */
export function useSEO({
  title,
  description,
  canonical,
  image,
  type = "website",
  robots,
  product,
  breadcrumbs,
  faqItems,
  noIndex = false,
} = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} — Authentic Andhra Homemade Pickles & Snacks`;

    const metaDesc = description || DEFAULT_DESCRIPTION;
    const ogImage = image || DEFAULT_IMAGE;
    const canonicalUrl = canonical || `${SITE_URL}${window.location.pathname}`;
    const robotsContent = noIndex
      ? "noindex,nofollow"
      : robots || "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";

    // ── Basic ──────────────────────────────────────────────────────────────
    document.title = fullTitle;
    setMeta("name", "description", metaDesc);
    setMeta("name", "robots", robotsContent);
    setLink("canonical", canonicalUrl);

    // ── Open Graph ─────────────────────────────────────────────────────────
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", metaDesc);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", title || SITE_NAME);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", type === "product" ? "product" : "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "en_IN");

    // ── Twitter Cards ──────────────────────────────────────────────────────
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", metaDesc);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:image:alt", title || SITE_NAME);
    setMeta("name", "twitter:site", "@NaiduGariRuchulu");

    // ── WhatsApp / Telegram ────────────────────────────────────────────────
    // WhatsApp uses og:image, og:title, og:description — already set above

    // ── JSON-LD: WebSite (always) ──────────────────────────────────────────
    setJsonLd("ld-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });

    // ── JSON-LD: Organization (always) ─────────────────────────────────────
    setJsonLd("ld-organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.webp`,
      image: ogImage,
      description: DEFAULT_DESCRIPTION,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Andhra Pradesh",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Telugu"],
        url: `${SITE_URL}/contact`,
      },
      sameAs: [
        "https://www.instagram.com/naidugariruchulu",
        "https://www.facebook.com/naidugariruchulu",
      ],
    });

    // ── JSON-LD: BreadcrumbList ────────────────────────────────────────────
    if (breadcrumbs && breadcrumbs.length > 0) {
      setJsonLd("ld-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: crumb.name,
          item: crumb.url.startsWith("http") ? crumb.url : `${SITE_URL}${crumb.url}`,
        })),
      });
    } else {
      removeJsonLd("ld-breadcrumb");
    }

    // ── JSON-LD: Product ──────────────────────────────────────────────────
    if (product) {
      const minPrice = product.variants
        ? Math.min(...product.variants.map((v) => v.price))
        : product.price || 0;
      const maxPrice = product.variants
        ? Math.max(...product.variants.map((v) => v.price))
        : product.price || 0;
      const inStock = product.variants
        ? product.variants.some((v) => v.stock > 0)
        : true;

      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images?.length > 0 ? product.images : [ogImage],
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        url: canonicalUrl,
        sku: product.slug || product._id,
        category: product.category
          ? product.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "Food",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount: product.variants?.length || 1,
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        },
      };

      // Add aggregateRating if reviews exist
      if (product.ratings?.count > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: product.ratings.average.toFixed(1),
          reviewCount: product.ratings.count,
          bestRating: "5",
          worstRating: "1",
        };
      }

      // Add individual reviews (max 5 for schema size)
      if (product.reviews?.length > 0) {
        productSchema.review = product.reviews.slice(0, 5).map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.name },
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: "5",
          },
          reviewBody: r.comment || "",
          datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : undefined,
        }));
      }

      setJsonLd("ld-product", productSchema);
    } else {
      removeJsonLd("ld-product");
    }

    // ── JSON-LD: FAQPage ──────────────────────────────────────────────────
    if (faqItems && faqItems.length > 0) {
      setJsonLd("ld-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    } else {
      removeJsonLd("ld-faq");
    }
  }, [title, description, canonical, image, type, robots, product, breadcrumbs, faqItems, noIndex]);
}

export { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_IMAGE };
