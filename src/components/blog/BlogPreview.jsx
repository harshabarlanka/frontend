/**
 * BlogPreview.jsx
 * Compact blog section for embedding on the HomePage.
 *
 * USAGE in HomePage.jsx:
 *   import BlogPreview from "../components/blog/BlogPreview";
 *   // Then add <BlogPreview /> wherever you want it in the page.
 *
 * Shows the 3 most recent published posts as horizontal cards.
 * Includes a "View All Articles" link to /blog.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getPublishedPosts, formatBlogDate, getCategoryLabel } from "../../data/blogData";

const BlogPreview = ({ limit = 3 }) => {
  const posts = useMemo(() => getPublishedPosts().slice(0, limit), [limit]);

  if (!posts.length) return null;

  return (
    <section
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      aria-labelledby="blog-preview-heading"
    >
      {/* Section header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2
            id="blog-preview-heading"
            className="font-display text-2xl sm:text-3xl text-earth-950"
          >
            From Our Kitchen
          </h2>
          <p className="font-body text-sm text-earth-500 mt-1">
            Recipes, guides, and stories about Andhra food
          </p>
        </div>
        <Link
          to="/blog"
          className="flex-shrink-0 font-body text-sm font-bold text-brand-700 hover:text-brand-600 transition-colors hidden sm:inline-flex items-center gap-1"
          aria-label="View all blog articles"
        >
          All Articles →
        </Link>
      </div>

      {/* Post cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group block bg-white rounded-2xl border border-earth-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all duration-200"
            aria-label={`Read blog post: ${post.title}`}
          >
            {/* Thumbnail */}
            <div className="h-44 bg-gradient-to-br from-earth-800 to-earth-950 relative overflow-hidden">
              {post.featuredImage?.src ? (
                <img
                  src={post.featuredImage.src}
                  alt={post.featuredImage.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <span className="font-display text-base text-brand-200 leading-snug line-clamp-3">
                    {post.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-earth-950/60 to-transparent" />
              <span className="absolute top-3 left-3 bg-brand-500/90 text-white text-xs font-body font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {getCategoryLabel(post.category)}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-earth-400 font-body mb-1.5">
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                <span aria-hidden>·</span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>
              <h3 className="font-display text-base text-earth-900 leading-snug mb-1.5 group-hover:text-brand-700 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="font-body text-xs text-earth-500 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile: View all link */}
      <div className="mt-6 text-center sm:hidden">
        <Link to="/blog" className="btn-ghost text-sm">
          View All Articles →
        </Link>
      </div>
    </section>
  );
};

export default BlogPreview;
