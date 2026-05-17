/**
 * BlogDetailPage.jsx
 * Individual blog article page — /blog/:slug
 *
 * Features:
 *  - Dynamic SEO (title, description, canonical, OG, Twitter cards)
 *  - Article JSON-LD schema
 *  - Breadcrumb schema
 *  - FAQ schema (when faqItems present)
 *  - Reading progress bar
 *  - Internal product & category links
 *  - Related posts section
 *  - Social share links (WhatsApp, Facebook, Twitter/X)
 *  - Mobile-first, accessible markup
 */

import { useEffect, useState, useRef } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import Breadcrumb from "../../components/common/Breadcrumb";
import {
  getPostBySlug,
  getRelatedPosts,
  formatBlogDate,
  getCategoryLabel,
  AUTHORS,
  BLOG_SITE_URL,
} from "../../data/blogData";

// ─── Reading Progress Bar ─────────────────────────────────────────────────────
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-brand-500 transition-all duration-100"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
};

// ─── Social Share ─────────────────────────────────────────────────────────────
const SocialShare = ({ url, title }) => {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.106 1.521 5.838L.057 23.5l5.806-1.527A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.899 0-3.68-.52-5.207-1.427l-.373-.223-3.445.906.92-3.361-.243-.386A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      ),
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-zinc-800 hover:bg-zinc-900",
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-body text-earth-500 mr-1">Share:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.name}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-body font-bold transition-colors ${l.color}`}
        >
          {l.icon}
          <span className="hidden sm:inline">{l.name}</span>
        </a>
      ))}
    </div>
  );
};

// ─── Related Products Panel ───────────────────────────────────────────────────
const RelatedProducts = ({ products }) => {
  if (!products?.length) return null;
  return (
    <aside
      className="bg-brand-50 border border-brand-200 rounded-xl p-5 my-8"
      aria-label="Related products"
    >
      <h3 className="font-display text-base text-earth-900 mb-3 flex items-center gap-2">
        <span className="text-brand-600">🛒</span> Buy These Products
      </h3>
      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <Link
            key={p.slug}
            to={`/product/${p.slug}`}
            className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-brand-100 hover:border-brand-400 hover:shadow-sm transition-all group"
          >
            <span className="font-body text-sm text-earth-800 group-hover:text-brand-700 font-medium">
              {p.name}
            </span>
            <span className="text-brand-600 text-sm font-bold group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

// ─── Related Posts ────────────────────────────────────────────────────────────
const RelatedPostsSection = ({ posts }) => {
  if (!posts?.length) return null;
  return (
    <section
      className="border-t border-earth-100 pt-8 mt-8"
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="font-display text-xl text-earth-900 mb-5"
      >
        Related Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group flex gap-3 bg-white rounded-xl p-4 border border-earth-100 hover:border-brand-200 hover:shadow-sm transition-all"
          >
            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-earth-700 to-earth-950 overflow-hidden">
              {post.featuredImage?.src && (
                <img
                  src={post.featuredImage.src}
                  alt={post.featuredImage.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-body font-bold text-brand-600 uppercase tracking-wide">
                {getCategoryLabel(post.category)}
              </span>
              <h3 className="font-display text-sm text-earth-900 leading-snug mt-0.5 group-hover:text-brand-700 transition-colors line-clamp-3">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ─── Related Categories ───────────────────────────────────────────────────────
const RelatedCategories = ({ categories }) => {
  if (!categories?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 my-6">
      <span className="text-sm font-body text-earth-500 self-center">Browse:</span>
      {categories.map((cat) => (
        <Link
          key={cat.path}
          to={cat.path}
          className="px-4 py-1.5 bg-earth-100 hover:bg-earth-900 hover:text-white text-earth-700 rounded-full text-sm font-body font-medium transition-colors"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
};

// ─── FAQ Section ─────────────────────────────────────────────────────────────
const FAQSection = ({ items }) => {
  const [open, setOpen] = useState(null);
  if (!items?.length) return null;

  return (
    <section
      className="border-t border-earth-100 pt-8 mt-8"
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="font-display text-xl text-earth-900 mb-5">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="border border-earth-100 rounded-xl overflow-hidden bg-white"
          >
            <button
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-body font-medium text-earth-900 hover:bg-earth-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="text-sm sm:text-base">{item.question}</span>
              <span
                className={`flex-shrink-0 text-earth-400 transition-transform duration-200 ${
                  open === i ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                ▾
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 font-body text-sm text-earth-600 leading-relaxed border-t border-earth-100">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Content Block Renderer ───────────────────────────────────────────────────
const ContentBlocks = ({ blocks, relatedProducts }) => {
  return (
    <div className="prose-blog">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "intro":
            return (
              <p
                key={i}
                className="font-body text-base sm:text-lg text-earth-700 leading-relaxed mb-6 border-l-4 border-brand-400 pl-4 bg-brand-50/40 py-3 pr-3 rounded-r-lg"
              >
                {block.content}
              </p>
            );

          case "h2":
            return (
              <h2
                key={i}
                className="font-display text-2xl text-earth-900 mt-10 mb-4 leading-snug"
              >
                {block.content}
              </h2>
            );

          case "h3":
            return (
              <h3
                key={i}
                className="font-display text-xl text-earth-800 mt-7 mb-3 leading-snug"
              >
                {block.content}
              </h3>
            );

          case "paragraph":
            return (
              <p
                key={i}
                className="font-body text-base text-earth-700 leading-relaxed mb-5"
              >
                {block.content}
              </p>
            );

          case "list":
            return (
              <ul key={i} className="mb-5 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 font-body text-sm sm:text-base text-earth-700">
                    <span className="flex-shrink-0 mt-1.5 w-2 h-2 bg-brand-500 rounded-full" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            );

          case "internal-link-cta":
            return (
              <div key={i} className="my-6">
                <Link
                  to={block.href}
                  className="inline-flex items-center gap-2 bg-earth-900 hover:bg-earth-950 text-white font-body font-bold px-5 py-3 rounded-lg text-sm transition-colors"
                >
                  {block.text}
                </Link>
              </div>
            );

          case "cta-block":
            return (
              <div
                key={i}
                className="my-10 bg-gradient-to-br from-earth-900 to-earth-950 rounded-2xl p-7 text-center"
              >
                <h3 className="font-display text-xl text-brand-200 mb-2">
                  {block.heading}
                </h3>
                <p className="font-body text-earth-300 text-sm mb-5">{block.text}</p>
                <Link
                  to={block.ctaHref}
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-body font-bold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  {block.ctaText}
                </Link>
              </div>
            );

          // Inline related-products panel inserted after a certain block index
          case "product-inline":
            return <RelatedProducts key={i} products={relatedProducts} />;

          default:
            return null;
        }
      })}
    </div>
  );
};

// ─── Article Schema injected via useSEO ──────────────────────────────────────
function buildArticleSchema(post, author) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.articleSchema?.headline || post.title,
    description: post.articleSchema?.description || post.metaDescription,
    image: post.featuredImage?.src
      ? [post.featuredImage.src]
      : [`${BLOG_SITE_URL}/og-default.webp`],
    author: {
      "@type": "Person",
      name: author?.name || "Naidu Gari Ruchulu",
    },
    publisher: {
      "@type": "Organization",
      name: "Naidu Gari Ruchulu",
      logo: {
        "@type": "ImageObject",
        url: `${BLOG_SITE_URL}/logo.webp`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BLOG_SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.articleSchema?.keywords || post.tags?.join(", "),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BlogDetailPage = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const articleRef = useRef(null);

  // Inject Article JSON-LD manually (useSEO handles breadcrumb + FAQ)
  useEffect(() => {
    if (!post) return;
    const author = AUTHORS[post.author];
    const schema = buildArticleSchema(post, author);
    let el = document.getElementById("ld-article");
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "ld-article";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
    return () => {
      const existing = document.getElementById("ld-article");
      if (existing) existing.remove();
    };
  }, [post]);

  // SEO hook — breadcrumbs + FAQ schema
  useSEO(
    post
      ? {
          title: post.seoTitle,
          description: post.metaDescription,
          canonical: `${BLOG_SITE_URL}${post.canonicalPath}`,
          image: post.featuredImage?.src || null,
          type: "article",
          breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ],
          faqItems: post.faqItems,
        }
      : { noIndex: true }
  );

  if (!post) return <Navigate to="/blog" replace />;

  const author = AUTHORS[post.author];
  const relatedPosts = getRelatedPosts(post);
  const fullUrl = `${BLOG_SITE_URL}/blog/${post.slug}`;

  // Insert related products panel after the 4th content block
  const enrichedBlocks = [...post.contentBlocks];
  if (post.relatedProducts?.length && enrichedBlocks.length > 4) {
    enrichedBlocks.splice(4, 0, { type: "product-inline" });
  }

  return (
    <>
      <ReadingProgress />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]}
          className="mb-6"
        />

        {/* Article header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-brand-500 text-white text-xs font-body font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {getCategoryLabel(post.category)}
            </span>
            {post.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-earth-100 text-earth-600 text-xs font-body px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-earth-950 leading-tight mb-4">
            {post.title}
          </h1>

          <p className="font-body text-base text-earth-600 leading-relaxed mb-5">
            {post.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-body text-earth-500 border-t border-b border-earth-100 py-3">
            <span className="font-medium text-earth-700">{author?.name}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readingTimeMinutes} min read</span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <>
                <span aria-hidden>·</span>
                <span className="text-earth-400">
                  Updated {formatBlogDate(post.updatedAt)}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Featured image */}
        {post.featuredImage?.src && (
          <figure className="mb-8 -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden">
            <img
              src={post.featuredImage.src}
              alt={post.featuredImage.alt}
              className="w-full h-64 sm:h-80 object-cover"
              loading="eager"
            />
            {post.featuredImage.caption && (
              <figcaption className="text-xs text-earth-400 text-center font-body mt-2 px-4">
                {post.featuredImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article body */}
        <article ref={articleRef}>
          <ContentBlocks
            blocks={enrichedBlocks}
            relatedProducts={post.relatedProducts}
          />
        </article>

        {/* Related categories */}
        <RelatedCategories categories={post.relatedCategories} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-earth-100 text-earth-600 text-xs font-body px-3 py-1.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Social share */}
        <div className="py-5 border-t border-b border-earth-100 my-6">
          <SocialShare url={fullUrl} title={post.seoTitle} />
        </div>

        {/* FAQ */}
        <FAQSection items={post.faqItems} />

        {/* Related posts */}
        <RelatedPostsSection posts={relatedPosts} />

        {/* Bottom CTA */}
        <div className="mt-10 bg-earth-950 rounded-2xl p-7 text-center">
          <p className="font-display text-xl text-brand-200 mb-2">
            Taste the authentic difference
          </p>
          <p className="font-body text-earth-300 text-sm mb-5">
            Handmade Andhra pickles, sweets & snacks — delivered pan-India.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/products" className="btn-primary text-sm">
              Shop All Products
            </Link>
            <Link
              to="/products?category=non-veg-pickles"
              className="btn-secondary text-sm"
            >
              Non-Veg Pickles
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
