/**
 * BlogPage.jsx
 * Blog listing page — /blog
 * SEO-optimised, mobile-first, matches existing design language
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import Breadcrumb from "../../components/common/Breadcrumb";
import {
  getPublishedPosts,
  getFeaturedPosts,
  BLOG_CATEGORIES,
  formatBlogDate,
  getCategoryLabel,
  BLOG_SITE_URL,
} from "../../data/blogData";

// ─── Hero / Featured card ─────────────────────────────────────────────────────
const FeaturedCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-earth-100 hover:shadow-md transition-shadow duration-300"
    aria-label={`Read: ${post.title}`}
  >
    {/* Featured image or gradient placeholder */}
    <div className="relative h-56 sm:h-64 bg-gradient-to-br from-earth-800 to-earth-950 overflow-hidden">
      {post.featuredImage?.src ? (
        <img
          src={post.featuredImage.src}
          alt={post.featuredImage.alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <span className="font-display text-xl text-brand-200 leading-snug line-clamp-3">
            {post.title}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-earth-950/70 to-transparent" />
      {/* Category pill */}
      <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-body font-bold px-3 py-1 rounded-full uppercase tracking-wide">
        {getCategoryLabel(post.category)}
      </span>
    </div>

    <div className="p-5">
      <div className="flex items-center gap-3 text-xs text-earth-400 font-body mb-2">
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>
      <h2 className="font-display text-lg text-earth-950 leading-snug mb-2 group-hover:text-brand-700 transition-colors">
        {post.title}
      </h2>
      <p className="font-body text-sm text-earth-600 line-clamp-2">{post.excerpt}</p>
      <span className="inline-block mt-4 text-sm font-body font-bold text-brand-700 group-hover:underline">
        Read article →
      </span>
    </div>
  </Link>
);

// ─── Regular post card ────────────────────────────────────────────────────────
const PostCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group flex gap-4 bg-white rounded-xl p-4 border border-earth-100 hover:border-brand-200 hover:shadow-sm transition-all duration-200"
    aria-label={`Read: ${post.title}`}
  >
    {/* Thumbnail / color block */}
    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-earth-700 to-earth-950">
      {post.featuredImage?.src && (
        <img
          src={post.featuredImage.src}
          alt={post.featuredImage.alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <span className="text-xs font-body font-bold text-brand-600 uppercase tracking-wide">
        {getCategoryLabel(post.category)}
      </span>
      <h3 className="font-display text-base text-earth-950 leading-snug mt-0.5 mb-1 group-hover:text-brand-700 transition-colors line-clamp-2">
        {post.title}
      </h3>
      <div className="flex items-center gap-2 text-xs text-earth-400 font-body">
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>
    </div>
  </Link>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const allPosts = useMemo(() => getPublishedPosts(), []);
  const featuredPosts = useMemo(() => getFeaturedPosts(2), []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return allPosts;
    return allPosts.filter((p) => p.category === activeCategory);
  }, [allPosts, activeCategory]);

  // Non-featured posts for "all articles" grid
  const gridPosts = useMemo(() => {
    const featuredIds = new Set(featuredPosts.map((p) => p.id));
    return filteredPosts.filter(
      (p) => activeCategory !== "all" || !featuredIds.has(p.id)
    );
  }, [filteredPosts, featuredPosts, activeCategory]);

  // SEO
  useSEO({
    title: "Andhra Food Blog — Recipes, Pickle Guides & Andhra Cuisine",
    description:
      "Explore authentic Andhra recipes, pickle buying guides, and food culture stories. Learn about Avakaya, Gongura Chicken Pickle, Andhra Sweets & more.",
    canonical: `${BLOG_SITE_URL}/blog`,
    type: "website",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
    ],
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
        className="mb-6"
      />

      {/* Page header */}
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl text-earth-950 mb-3">
          Andhra Food Blog
        </h1>
        <p className="font-body text-earth-600 text-base max-w-2xl">
          Authentic recipes, pickle-making guides, and stories from a traditional Andhra kitchen.
        </p>
      </header>

      {/* Category filter tabs */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide"
        role="tablist"
        aria-label="Filter posts by category"
      >
        <button
          role="tab"
          aria-selected={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-body font-bold transition-all duration-200 ${
            activeCategory === "all"
              ? "bg-earth-900 text-white"
              : "bg-earth-100 text-earth-700 hover:bg-earth-200"
          }`}
        >
          All Articles
        </button>
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={activeCategory === cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-body font-bold transition-all duration-200 ${
              activeCategory === cat.slug
                ? "bg-earth-900 text-white"
                : "bg-earth-100 text-earth-700 hover:bg-earth-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured posts (only shown in "All" view) */}
      {activeCategory === "all" && featuredPosts.length > 0 && (
        <section aria-labelledby="featured-heading" className="mb-10">
          <h2
            id="featured-heading"
            className="font-display text-xl text-earth-800 mb-5"
          >
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featuredPosts.map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* All / filtered posts */}
      <section aria-labelledby="articles-heading">
        <h2
          id="articles-heading"
          className="font-display text-xl text-earth-800 mb-5"
        >
          {activeCategory === "all"
            ? "More Articles"
            : getCategoryLabel(activeCategory)}
        </h2>

        {gridPosts.length === 0 ? (
          <div className="text-center py-16 text-earth-400 font-body">
            No articles in this category yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gridPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Strip */}
      <div className="mt-14 bg-earth-950 rounded-2xl p-7 sm:p-10 text-center">
        <p className="font-display text-2xl text-brand-200 mb-2">
          Ready to taste authentic Andhra?
        </p>
        <p className="font-body text-earth-300 text-sm mb-5">
          Homemade pickles, sweets & snacks — delivered pan-India.
        </p>
        <Link to="/products" className="btn-primary">
          Shop All Products
        </Link>
      </div>
    </div>
  );
};

export default BlogPage;
