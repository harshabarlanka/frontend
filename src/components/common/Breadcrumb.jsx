/**
 * Breadcrumb.jsx
 * Accessible, SEO-friendly breadcrumb navigation.
 * Renders a <nav aria-label="breadcrumb"> with schema.org BreadcrumbList
 * structured data embedded inline for crawlers that don't execute JS.
 */

import { Link } from "react-router-dom";

/**
 * @param {Array<{name: string, url: string}>} items - Breadcrumb trail
 * @param {string} [className]
 */
const Breadcrumb = ({ items = [], className = "" }) => {
  if (!items || items.length === 0) return null;

  const SITE_URL =
    import.meta.env.VITE_SITE_URL || "https://naidugariruchulu.vercel.app";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <>
      {/* Inline JSON-LD for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <nav
        aria-label="breadcrumb"
        className={`flex items-center flex-wrap gap-1.5 text-xs font-body text-earth-400 ${className}`}
      >
        <ol
          className="flex items-center flex-wrap gap-1.5"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li
                key={idx}
                className="flex items-center gap-1.5"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {isLast ? (
                  <span
                    className="text-earth-700 truncate max-w-[160px]"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      to={item.url}
                      className="hover:text-brand-600 transition-colors"
                      itemProp="item"
                    >
                      <span itemProp="name">{item.name}</span>
                    </Link>
                    <span aria-hidden="true" className="text-earth-300">
                      /
                    </span>
                  </>
                )}
                <meta itemProp="position" content={String(idx + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
