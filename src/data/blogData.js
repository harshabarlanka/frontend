/**
 * blogData.js
 * Static blog data store for Naidu Gari Ruchulu
 *
 * HOW TO ADD A NEW POST:
 * 1. Copy any existing post object
 * 2. Give it a unique `id` and `slug` (slug = URL path)
 * 3. Fill all required fields (title, seoTitle, metaDescription, etc.)
 * 4. Add full content using the contentBlocks array
 * 5. Save — the site auto-picks it up. No build step needed.
 *
 * SLUG RULES:
 * - lowercase, hyphens only, no spaces or special chars
 * - SEO-friendly: include the main keyword
 * - Example: "best-andhra-chicken-pickle-online"
 */

export const BLOG_SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://naidugariruchulu.vercel.app";

// ─── AUTHOR REGISTRY ──────────────────────────────────────────────────────────
export const AUTHORS = {
  naiduGari: {
    id: "naiduGari",
    name: "Naidu Gari Ruchulu",
    role: "Andhra Food Expert",
    bio: "Authentic recipes and stories from a traditional Andhra kitchen, passed down through generations.",
    avatar: null, // Replace with actual avatar image path when available
  },
};

// ─── BLOG CATEGORIES ─────────────────────────────────────────────────────────
export const BLOG_CATEGORIES = [
  { slug: "recipes", label: "Recipes & How-To" },
  { slug: "andhra-food", label: "Andhra Food Culture" },
  { slug: "buying-guides", label: "Buying Guides" },
  { slug: "health-benefits", label: "Health & Nutrition" },
  { slug: "product-stories", label: "Product Stories" },
];

// ─── BLOG POSTS ───────────────────────────────────────────────────────────────
export const BLOG_POSTS = [
  // ── POST 1 ──────────────────────────────────────────────────────────────────
  {
    id: "1",
    slug: "best-andhra-pickles-online-india",
    status: "published",

    // SEO metadata
    seoTitle: "Best Andhra Pickles to Buy Online in India (2025 Guide)",
    metaDescription:
      "Looking for the best Andhra pickles online? Discover authentic Avakaya, Gongura, Chicken Pickle & more. Free pan-India delivery. Homemade. Preservative-free.",
    ogImage: null, // Falls back to site default OG image
    canonicalPath: "/blog/best-andhra-pickles-online-india",

    // Display metadata
    title: "Best Andhra Pickles to Buy Online in India",
    excerpt:
      "From spicy Avakaya to tangy Gongura Chicken — a complete guide to the best authentic Andhra pickles you can order online with pan-India delivery.",
    category: "buying-guides",
    tags: ["andhra pickles", "buy pickles online", "avakaya", "gongura", "non-veg pickles"],
    author: "naiduGari",
    publishedAt: "2025-01-10",
    updatedAt: "2025-05-01",
    readingTimeMinutes: 7,
    featured: true,
    featuredImage: {
      src: null, // Replace with actual image URL, e.g. "/blog/andhra-pickles-guide.webp"
      alt: "Assorted authentic Andhra pickles — Avakaya, Gongura, Chicken Pickle",
      caption: "A traditional Andhra pickle spread — made fresh in our kitchen",
    },

    // Internal linking
    relatedProducts: [
      { name: "Avakaya Pickle", slug: "avakaya-mango-pickle", category: "veg-pickles" },
      { name: "Chicken Pickle", slug: "chicken-pickle", category: "non-veg-pickles" },
      { name: "Gongura Chicken Pickle", slug: "gongura-chicken-pickle", category: "non-veg-pickles" },
    ],
    relatedCategories: [
      { name: "Veg Pickles", path: "/products?category=veg-pickles" },
      { name: "Non-Veg Pickles", path: "/products?category=non-veg-pickles" },
    ],
    relatedPosts: ["traditional-andhra-chicken-pickle-recipe", "why-gongura-pickle-is-famous"],

    // Article schema fields
    articleSchema: {
      headline: "Best Andhra Pickles to Buy Online in India (2025 Guide)",
      description:
        "A comprehensive buying guide covering the most authentic Andhra pickles available online — from Avakaya to Gongura Chicken Pickle — with tips on quality, shelf life, and ordering.",
      keywords: "Andhra pickles online, buy Avakaya online, Gongura pickle, Chicken pickle Andhra, homemade pickles India",
    },

    // Content blocks — rendered in order
    contentBlocks: [
      {
        type: "intro",
        content:
          "If you grew up in an Andhra household, you know that a meal without pickle is incomplete. Whether it's the fiery raw mango Avakaya or the tangy Gongura chicken that makes your taste buds dance — Andhra pickles are in a league of their own. But finding truly authentic, homemade-quality Andhra pickles online can be a challenge. This guide covers the best options, what to look for, and why quality matters.",
      },
      {
        type: "h2",
        content: "Why Andhra Pickles Are Different",
      },
      {
        type: "paragraph",
        content:
          "Andhra Pradesh has one of the most vibrant pickle cultures in India. The region's love for spice, tang, and bold flavors translates directly into how its pickles are made. Traditional Andhra pickles use cold-pressed sesame oil (gingelly oil), sun-dried spices, and zero artificial preservatives. The fermentation process is natural, which not only gives the pickle its signature depth of flavor but also makes it a probiotic-rich food.",
      },
      {
        type: "h2",
        content: "Top Andhra Pickles to Buy Online",
      },
      {
        type: "h3",
        content: "1. Avakaya (Raw Mango Pickle) — The King of Andhra Pickles",
      },
      {
        type: "paragraph",
        content:
          "Avakaya is the undisputed king of Andhra pickles. Made from raw Totapuri or Banganapalli mangoes, mixed with mustard powder, red chilli powder, salt, and sesame oil — every spoonful is a burst of flavor. The best Avakaya is made when mangoes are in season (March–June) and then preserved to last through the year. Look for pickles that use fresh-ground mustard and high-quality sesame oil.",
      },
      {
        type: "internal-link-cta",
        text: "Try our authentic Avakaya Pickle →",
        href: "/product/avakaya-mango-pickle",
        productSlug: "avakaya-mango-pickle",
      },
      {
        type: "h3",
        content: "2. Gongura Pickle — Andhra's Tangy Pride",
      },
      {
        type: "paragraph",
        content:
          "Gongura (sorrel leaves) is so central to Andhra food culture that the plant is often called the 'state plant' of Andhra Pradesh. Gongura pickle has a distinctive tartness that pairs beautifully with hot rice and ghee. It's available as a plain Gongura pickle or the more indulgent Gongura Chicken Pickle — a true delicacy.",
      },
      {
        type: "h3",
        content: "3. Chicken Pickle — Bold, Spicy, Irresistible",
      },
      {
        type: "paragraph",
        content:
          "Andhra-style Chicken Pickle is a slow-cooked, deeply spiced non-veg pickle that's unlike anything you'll find elsewhere in India. The chicken is cooked with whole spices, red chilli, and sesame oil until the flavors meld into something extraordinary. It works as a side dish, a spread, or even a quick meal with rice.",
      },
      {
        type: "internal-link-cta",
        text: "Shop Non-Veg Pickles — Chicken, Gongura Chicken, Prawns & more →",
        href: "/products?category=non-veg-pickles",
        productSlug: null,
      },
      {
        type: "h3",
        content: "4. Prawns Pickle — A Coastal Andhra Gem",
      },
      {
        type: "paragraph",
        content:
          "Prawns Pickle is a specialty from coastal Andhra, particularly around Kakinada and Rajahmundry. The prawns are cleaned, sun-dried, and then cooked with a rich masala of red chilli, cumin, and sesame oil. It has an intense umami depth that seafood lovers absolutely adore.",
      },
      {
        type: "h3",
        content: "5. Mutton Pickle — Rich, Hearty, Full-Flavored",
      },
      {
        type: "paragraph",
        content:
          "Mutton Pickle is a celebration-worthy product. Tender mutton pieces are slow-cooked with whole spices, Guntur red chillies, and sesame oil. The result is a rich, hearty pickle with complex layers of spice and smoke. It's best enjoyed with curd rice or as an appetizer.",
      },
      {
        type: "h2",
        content: "What to Look for When Buying Andhra Pickles Online",
      },
      {
        type: "list",
        items: [
          "No artificial preservatives — check the ingredient list carefully.",
          "Cold-pressed sesame oil (nuvvula nune) for authentic flavor and longer shelf life.",
          "Fresh-ground spices — not store-bought masala powders.",
          "Handmade / small-batch production — large factories sacrifice quality for volume.",
          "Proper packaging — airtight glass jars are better than plastic for pickles.",
          "Clear manufacture and best-before dates.",
        ],
      },
      {
        type: "h2",
        content: "How to Store Andhra Pickles",
      },
      {
        type: "paragraph",
        content:
          "Once opened, store your pickles in a cool, dry place away from direct sunlight. Always use a dry, clean spoon to scoop the pickle — moisture is the enemy of a well-made pickle. Most authentic Andhra pickles last 6–12 months when stored properly. Refrigeration is optional but extends freshness after opening.",
      },
      {
        type: "h2",
        content: "Why Choose Naidu Gari Ruchulu Pickles?",
      },
      {
        type: "paragraph",
        content:
          "At Naidu Gari Ruchulu, every pickle is made the way our grandmothers made them — using seasonal ingredients, fresh-ground spices, and cold-pressed sesame oil. We ship pan-India and take pride in delivering the authentic taste of Andhra to your doorstep. Our pickles are preservative-free, made in small batches, and packed in hygienic, tamper-proof containers.",
      },
      {
        type: "cta-block",
        heading: "Ready to taste authentic Andhra?",
        text: "Browse our full collection of pickles — veg, non-veg, and seasonal specials.",
        ctaText: "Shop Pickles Now",
        ctaHref: "/products",
      },
    ],

    // FAQ schema
    faqItems: [
      {
        question: "Which Andhra pickle is the most popular?",
        answer:
          "Avakaya (raw mango pickle) is the most iconic Andhra pickle. Among non-veg options, Chicken Pickle and Gongura Chicken Pickle are extremely popular.",
      },
      {
        question: "Are Andhra pickles spicy?",
        answer:
          "Yes, most traditional Andhra pickles use Guntur red chillies, which are known for their heat. However, spice levels vary by product — some are medium-spicy while others are very hot.",
      },
      {
        question: "Do you use preservatives in your pickles?",
        answer:
          "No. Our pickles use natural preservation methods — cold-pressed sesame oil, salt, and sun-dried spices — with zero artificial preservatives or additives.",
      },
      {
        question: "Do you ship Andhra pickles across India?",
        answer:
          "Yes, we offer pan-India delivery. Orders are typically dispatched within 1–2 business days and delivered in 3–7 days depending on your location.",
      },
    ],
  },

  // ── POST 2 ──────────────────────────────────────────────────────────────────
  {
    id: "2",
    slug: "traditional-andhra-chicken-pickle-recipe",
    status: "published",

    seoTitle: "Traditional Andhra Chicken Pickle Recipe — How It's Made",
    metaDescription:
      "Learn how authentic Andhra Chicken Pickle is made the traditional way — slow-cooked with Guntur chillies, sesame oil & whole spices. Step-by-step process explained.",
    ogImage: null,
    canonicalPath: "/blog/traditional-andhra-chicken-pickle-recipe",

    title: "How Traditional Andhra Chicken Pickle Is Made",
    excerpt:
      "Discover the slow-cooked, deeply spiced process behind authentic Andhra Chicken Pickle — from selecting the right ingredients to the final bottling.",
    category: "recipes",
    tags: ["chicken pickle recipe", "Andhra chicken pickle", "non-veg pickle", "homemade chicken pickle"],
    author: "naiduGari",
    publishedAt: "2025-01-25",
    updatedAt: "2025-04-15",
    readingTimeMinutes: 8,
    featured: true,
    featuredImage: {
      src: null,
      alt: "Homemade Andhra Chicken Pickle being prepared with traditional spices",
      caption: "Traditional Andhra Chicken Pickle — slow-cooked with Guntur chillies and sesame oil",
    },

    relatedProducts: [
      { name: "Chicken Pickle", slug: "chicken-pickle", category: "non-veg-pickles" },
      { name: "Gongura Chicken Pickle", slug: "gongura-chicken-pickle", category: "non-veg-pickles" },
      { name: "Mutton Pickle", slug: "mutton-pickle", category: "non-veg-pickles" },
    ],
    relatedCategories: [
      { name: "Non-Veg Pickles", path: "/products?category=non-veg-pickles" },
    ],
    relatedPosts: ["best-andhra-pickles-online-india", "why-gongura-pickle-is-famous"],

    articleSchema: {
      headline: "How Traditional Andhra Chicken Pickle Is Made",
      description:
        "A detailed walkthrough of the traditional process for making authentic Andhra Chicken Pickle — ingredients, cooking method, and the secrets that give it its iconic flavor.",
      keywords: "Andhra chicken pickle recipe, how to make chicken pickle, traditional chicken pickle, non-veg pickle recipe",
    },

    contentBlocks: [
      {
        type: "intro",
        content:
          "Andhra Chicken Pickle is not your average achaar. It's a slow-cooked, deeply spiced preparation that takes patience, the right spices, and a good amount of sesame oil to get right. In Andhra homes, making chicken pickle is almost a ritual — one that involves the whole family and fills the kitchen with an aroma that lingers for days.",
      },
      {
        type: "h2",
        content: "The Ingredients That Define Andhra Chicken Pickle",
      },
      {
        type: "paragraph",
        content:
          "The secret to a great Andhra chicken pickle lies in its ingredients. Every component is intentional — from the type of oil to the variety of chilli used.",
      },
      {
        type: "list",
        items: [
          "Bone-in country chicken (naati kodi) — gives a richer, deeper flavor than broiler",
          "Guntur dry red chillies — the backbone of Andhra spice; bold heat with fruity undertones",
          "Cold-pressed sesame oil (gingelly oil) — acts as a natural preservative and gives the pickle its signature taste",
          "Fresh garlic — added generously for sharpness and depth",
          "Cumin seeds and mustard seeds — toasted for warmth and aroma",
          "Turmeric and salt — for preservation and base seasoning",
          "Curry leaves — added late for their volatile oils",
          "Fenugreek powder — a tiny amount adds a subtle bitterness that balances the heat",
        ],
      },
      {
        type: "h2",
        content: "The Traditional Preparation Process",
      },
      {
        type: "h3",
        content: "Step 1: Cleaning and Marinating the Chicken",
      },
      {
        type: "paragraph",
        content:
          "The chicken is cleaned thoroughly and cut into small pieces. It's then marinated with turmeric, salt, and a portion of red chilli powder for at least 30 minutes — this both flavors the meat and starts the preservation process.",
      },
      {
        type: "h3",
        content: "Step 2: Frying the Chicken",
      },
      {
        type: "paragraph",
        content:
          "The marinated chicken is deep-fried in sesame oil until it's cooked through and has a slight crisp on the outside. This step is crucial — it removes moisture from the chicken, which is essential for a long-lasting pickle. The frying oil is reserved and used later in the pickle.",
      },
      {
        type: "h3",
        content: "Step 3: Preparing the Masala",
      },
      {
        type: "paragraph",
        content:
          "Separately, whole spices are dry-roasted and ground with the Guntur chillies. Garlic is sautéed in sesame oil until golden, then the spice powder is added and cooked on low heat until the oil separates from the masala — a sign that the spices are fully cooked.",
      },
      {
        type: "h3",
        content: "Step 4: Combining and Slow-Cooking",
      },
      {
        type: "paragraph",
        content:
          "The fried chicken is added to the masala and slow-cooked on a very low flame for 20–30 minutes, stirring occasionally. The chicken absorbs all the spices during this time. Curry leaves and additional sesame oil are added at this stage.",
      },
      {
        type: "h3",
        content: "Step 5: Resting and Bottling",
      },
      {
        type: "paragraph",
        content:
          "The pickle is allowed to cool completely before bottling. A good Andhra chicken pickle actually tastes better after 2–3 days as the flavors mature and deepen. It's bottled in airtight glass jars and stored in a cool, dry place.",
      },
      {
        type: "h2",
        content: "What Makes It Different from Regular Chicken Curry",
      },
      {
        type: "paragraph",
        content:
          "Unlike a curry, chicken pickle has very little water content — it's preserved in oil and spices. The cooking process removes almost all moisture from the chicken, which is why it can last for months without refrigeration. The flavor profile is also very different — concentrated, intense, and deeply spiced.",
      },
      {
        type: "h2",
        content: "Want the Authentic Taste Without the Effort?",
      },
      {
        type: "paragraph",
        content:
          "Making traditional Andhra Chicken Pickle at home requires sourcing the right ingredients and a good amount of time. If you want the authentic taste without the hours in the kitchen, our homemade Chicken Pickle is made following the exact same traditional process — in small batches, with no shortcuts.",
      },
      {
        type: "internal-link-cta",
        text: "Order Authentic Chicken Pickle — Pan-India Delivery →",
        href: "/product/chicken-pickle",
        productSlug: "chicken-pickle",
      },
      {
        type: "cta-block",
        heading: "Love Non-Veg Pickles?",
        text: "Explore our full range — Chicken, Gongura Chicken, Prawns, and Mutton Pickle.",
        ctaText: "Shop Non-Veg Pickles",
        ctaHref: "/products?category=non-veg-pickles",
      },
    ],

    faqItems: [
      {
        question: "How long does homemade Andhra Chicken Pickle last?",
        answer:
          "When stored properly in a dry, clean jar away from moisture, Andhra Chicken Pickle lasts 3–6 months at room temperature. Refrigerating after opening extends freshness further.",
      },
      {
        question: "Can I make Andhra Chicken Pickle without bones?",
        answer:
          "Yes, boneless chicken can be used, but bone-in country chicken gives a richer flavor because the collagen from the bones adds body to the pickle masala.",
      },
      {
        question: "Is sesame oil necessary for Andhra Chicken Pickle?",
        answer:
          "Sesame (gingelly) oil is the traditional choice and acts as a natural preservative. Substituting it with other oils changes both the flavor and the shelf life significantly.",
      },
    ],
  },

  // ── POST 3 ──────────────────────────────────────────────────────────────────
  {
    id: "3",
    slug: "why-gongura-pickle-is-famous",
    status: "published",

    seoTitle: "Why Gongura Pickle Is So Famous in Andhra Pradesh",
    metaDescription:
      "Gongura pickle is Andhra Pradesh's most beloved condiment. Discover its history, health benefits, and why it's called the soul of Andhra cuisine. Buy online with delivery.",
    ogImage: null,
    canonicalPath: "/blog/why-gongura-pickle-is-famous",

    title: "Why Gongura Pickle Is the Soul of Andhra Cuisine",
    excerpt:
      "Gongura (sorrel leaves) is so integral to Andhra food that the state is nicknamed 'Gongura Country'. Here's the story of this beloved pickle and why it's unlike anything else.",
    category: "andhra-food",
    tags: ["gongura pickle", "Andhra food culture", "gongura chicken", "sorrel leaves", "Andhra cuisine"],
    author: "naiduGari",
    publishedAt: "2025-02-08",
    updatedAt: "2025-04-20",
    readingTimeMinutes: 6,
    featured: false,
    featuredImage: {
      src: null,
      alt: "Fresh gongura leaves used to make authentic Andhra Gongura Pickle",
      caption: "Gongura (sorrel leaves) — the heart of Andhra's most beloved pickle",
    },

    relatedProducts: [
      { name: "Gongura Chicken Pickle", slug: "gongura-chicken-pickle", category: "non-veg-pickles" },
      { name: "Chicken Pickle", slug: "chicken-pickle", category: "non-veg-pickles" },
    ],
    relatedCategories: [
      { name: "Non-Veg Pickles", path: "/products?category=non-veg-pickles" },
      { name: "Veg Pickles", path: "/products?category=veg-pickles" },
    ],
    relatedPosts: ["best-andhra-pickles-online-india", "traditional-andhra-chicken-pickle-recipe"],

    articleSchema: {
      headline: "Why Gongura Pickle Is the Soul of Andhra Cuisine",
      description:
        "An exploration of gongura (sorrel leaves) — its role in Andhra food culture, health benefits, how gongura pickle is made, and why it's one of India's most distinctive regional pickles.",
      keywords: "gongura pickle, gongura meaning, Andhra pickle, sorrel leaf pickle, gongura chicken",
    },

    contentBlocks: [
      {
        type: "intro",
        content:
          "Ask any Andhra person what they miss most about home when they're away, and chances are gongura will come up in the first sentence. This bright-green, tangy sorrel leaf has a hold on Andhra food culture that's hard to overstate. Its pickle — made from sautéed gongura leaves with red chillies and sesame oil — is eaten with everything from hot rice to dosas to chapati.",
      },
      {
        type: "h2",
        content: "What Is Gongura?",
      },
      {
        type: "paragraph",
        content:
          "Gongura is the Telugu name for Hibiscus sabdariffa — commonly known as sorrel or roselle. The plant grows prolifically in Andhra Pradesh, particularly in the Krishna and Godavari districts. There are two main varieties: red-stemmed gongura (more tart, stronger flavor) and green-stemmed gongura (milder). The red-stemmed variety is preferred for pickling because of its intense tanginess.",
      },
      {
        type: "h2",
        content: "The Cultural Significance of Gongura in Andhra",
      },
      {
        type: "paragraph",
        content:
          "Gongura is so central to Andhra identity that the state is affectionately called 'Gongura Country' by food writers. It appears in everything — dals, chutneys, curries, rice dishes, and of course pickles. In Andhra households, the annual tradition of making gongura pickle at home (using freshly harvested leaves) is still alive and cherished. Gifts of homemade gongura pickle are considered expressions of love.",
      },
      {
        type: "h2",
        content: "Health Benefits of Gongura",
      },
      {
        type: "list",
        items: [
          "Rich in iron — helps prevent anaemia, which is why it was traditionally given to new mothers",
          "High in Vitamin C — provides natural immunity boost",
          "Excellent source of antioxidants — from its deep red pigments (anthocyanins)",
          "Anti-inflammatory properties — from the sorrel's natural acids",
          "Supports digestion — the tanginess stimulates digestive juices",
          "Low glycemic index — suitable for diabetics in moderate amounts",
        ],
      },
      {
        type: "h2",
        content: "How Gongura Pickle Is Made",
      },
      {
        type: "paragraph",
        content:
          "Traditional gongura pickle starts with fresh leaves being washed and dried completely (moisture is the enemy of any good pickle). The leaves are then sautéed in sesame oil with red chillies, garlic, and cumin until wilted and fragrant. Separately, mustard and fenugreek are dry-roasted and powdered. Everything is combined, cooled, and packed with a generous pour of sesame oil on top to seal and preserve.",
      },
      {
        type: "h2",
        content: "Gongura Chicken Pickle — When Two Icons Meet",
      },
      {
        type: "paragraph",
        content:
          "If gongura pickle on its own is a masterpiece, Gongura Chicken Pickle is a revelation. The tartness of gongura cuts through the richness of slow-cooked chicken, creating a pickle that's simultaneously tangy, spicy, and deeply savory. It's a non-veg version that's become wildly popular — both in Andhra and among Andhra communities across India and abroad.",
      },
      {
        type: "internal-link-cta",
        text: "Try our Gongura Chicken Pickle — Made Fresh in Small Batches →",
        href: "/product/gongura-chicken-pickle",
        productSlug: "gongura-chicken-pickle",
      },
      {
        type: "h2",
        content: "Where to Buy Authentic Gongura Pickle Online",
      },
      {
        type: "paragraph",
        content:
          "The challenge with buying gongura pickle online is that many commercial brands use dried gongura powder instead of fresh leaves, which significantly diminishes the flavor. At Naidu Gari Ruchulu, we use fresh gongura leaves sourced seasonally, and every batch is made by hand — not in a factory. The difference is clear in the taste.",
      },
      {
        type: "cta-block",
        heading: "Order Authentic Gongura Pickle Online",
        text: "Fresh-made, preservative-free Gongura and Gongura Chicken Pickle. Delivered pan-India.",
        ctaText: "Shop Gongura Pickles",
        ctaHref: "/products?category=non-veg-pickles",
      },
    ],

    faqItems: [
      {
        question: "What does gongura taste like?",
        answer:
          "Gongura has a distinctive tart, tangy, slightly sour taste — similar to tamarind but greener and more vegetal. In pickle form, it combines with spices and sesame oil to create a bold, complex flavor.",
      },
      {
        question: "Is gongura available outside Andhra Pradesh?",
        answer:
          "Fresh gongura leaves can be found in Indian grocery stores in major cities. However, the best way to enjoy authentic gongura pickle outside Andhra is to order it directly from trusted homemade pickle brands.",
      },
      {
        question: "Can vegetarians eat gongura pickle?",
        answer:
          "Yes! Plain gongura pickle is fully vegetarian — it contains only gongura leaves, sesame oil, chillies, and spices. The Gongura Chicken Pickle is a separate, non-vegetarian product.",
      },
    ],
  },

  // ── POST 4 ──────────────────────────────────────────────────────────────────
  {
    id: "4",
    slug: "how-homemade-avakaya-is-prepared",
    status: "published",

    seoTitle: "How Homemade Avakaya Is Prepared — Traditional Andhra Mango Pickle",
    metaDescription:
      "Avakaya is Andhra's most famous pickle. Learn the traditional step-by-step process of making homemade Avakaya mango pickle — ingredients, seasoning, and storage tips.",
    ogImage: null,
    canonicalPath: "/blog/how-homemade-avakaya-is-prepared",

    title: "How Homemade Avakaya Is Prepared — The Andhra Way",
    excerpt:
      "Avakaya is more than a pickle — it's an Andhra institution. Here's how it's traditionally made at home: from selecting the right mangoes to seasoning and resting.",
    category: "recipes",
    tags: ["avakaya recipe", "mango pickle", "Andhra avakaya", "homemade mango pickle", "veg pickles"],
    author: "naiduGari",
    publishedAt: "2025-03-01",
    updatedAt: "2025-05-01",
    readingTimeMinutes: 9,
    featured: false,
    featuredImage: {
      src: null,
      alt: "Fresh raw mangoes being prepared for traditional Andhra Avakaya pickle",
      caption: "Raw mangoes, mustard powder, and sesame oil — the holy trinity of Avakaya",
    },

    relatedProducts: [
      { name: "Avakaya Pickle", slug: "avakaya-mango-pickle", category: "veg-pickles" },
    ],
    relatedCategories: [
      { name: "Veg Pickles", path: "/products?category=veg-pickles" },
    ],
    relatedPosts: ["best-andhra-pickles-online-india", "why-gongura-pickle-is-famous"],

    articleSchema: {
      headline: "How Homemade Avakaya Is Prepared — The Andhra Way",
      description:
        "A complete walkthrough of the traditional Andhra Avakaya (raw mango pickle) making process — mango selection, spice ratios, marination time, and storage.",
      keywords: "avakaya recipe, how to make Avakaya, Andhra mango pickle, homemade avakaya, raw mango pickle recipe",
    },

    contentBlocks: [
      {
        type: "intro",
        content:
          "In Andhra households, the arrival of summer signals one thing above all else: mango season, and therefore Avakaya season. Every family has their own recipe — some prefer it more tart, some more fiery — but the process is sacred and largely the same across generations. Making Avakaya is a summer ritual that fills the house with the aroma of mustard and chilli, and the results sustain the family all year long.",
      },
      {
        type: "h2",
        content: "Choosing the Right Mango",
      },
      {
        type: "paragraph",
        content:
          "Not all mangoes work for Avakaya. The ideal mango is raw (unripe), firm, and very tart. The most popular varieties used are Banganapalli (also called Safeda) and Totapuri, both of which are sour and hold their shape well after pickling. The mango should be completely green — any hint of yellow means it's too ripe and will turn mushy in the pickle.",
      },
      {
        type: "h2",
        content: "The Essential Ingredients",
      },
      {
        type: "list",
        items: [
          "Raw Banganapalli or Totapuri mangoes — firm, green, very tart",
          "Mustard powder (freshly ground yellow/brown mustard seeds) — gives the classic bite",
          "Guntur red chilli powder — for heat and color",
          "Fenugreek powder — just a pinch; adds a subtle bitter note",
          "Turmeric powder — preservation and color",
          "Rock salt (Sendha namak) — more traditional, better flavor than table salt",
          "Cold-pressed sesame oil — the binding agent and preservative",
          "Garlic cloves (optional) — some families add, some don't",
        ],
      },
      {
        type: "h2",
        content: "The Traditional Preparation Method",
      },
      {
        type: "h3",
        content: "Step 1: Cutting the Mangoes",
      },
      {
        type: "paragraph",
        content:
          "The mangoes are washed and thoroughly dried — no moisture should remain. Each mango is cut into uniform pieces (typically 1-inch cubes with the skin on and seed kernel included — the kernel adds a distinctive flavor as it marinates). The pieces are dried in the sun or with a clean cloth to remove all surface moisture.",
      },
      {
        type: "h3",
        content: "Step 2: Preparing the Spice Mix",
      },
      {
        type: "paragraph",
        content:
          "Mustard seeds are dry-roasted and ground fresh. Combined with red chilli powder, salt, fenugreek powder, and turmeric — the ratio matters enormously here. Traditional Andhra Avakaya uses roughly equal quantities of mustard powder and chilli powder by weight. The salt is measured carefully — too little and the pickle won't preserve; too much and it'll be inedible.",
      },
      {
        type: "h3",
        content: "Step 3: Mixing and Marinating",
      },
      {
        type: "paragraph",
        content:
          "The spice mix is tossed through the mango pieces in a large ceramic or stainless steel vessel. Sesame oil is poured in generously and mixed well. This mixture is then left to marinate in the vessel, covered with a cloth (not an airtight lid — the pickle needs to breathe during the initial fermentation), for 3–5 days at room temperature.",
      },
      {
        type: "h3",
        content: "Step 4: Daily Stirring",
      },
      {
        type: "paragraph",
        content:
          "During the marination period, the pickle is stirred once or twice daily using a dry wooden ladle. The mango releases its juices, which combine with the spices and oil to form the delicious, thick masala coating. By day 3, the mango begins to soften slightly and the flavors start to integrate.",
      },
      {
        type: "h3",
        content: "Step 5: Bottling and Resting",
      },
      {
        type: "paragraph",
        content:
          "After 4–5 days, the Avakaya is ready to be bottled. It's packed into clean, dry glass jars with a layer of sesame oil on top to seal. The pickle tastes good immediately but reaches its peak flavor after 2–3 weeks of resting.",
      },
      {
        type: "h2",
        content: "How to Serve Avakaya",
      },
      {
        type: "paragraph",
        content:
          "The classic Andhra way is hot white rice + ghee + Avakaya + papad. A dollop of the pickle alongside a bowl of curd rice is equally beloved. It also works as a spread on chapati, a condiment with dosas, or even as an ingredient in Avakaya pulihora (tamarind rice with mango pickle).",
      },
      {
        type: "internal-link-cta",
        text: "Order our Traditional Avakaya Pickle — Just Like Grandma Made →",
        href: "/product/avakaya-mango-pickle",
        productSlug: "avakaya-mango-pickle",
      },
      {
        type: "cta-block",
        heading: "Browse All Veg Pickles",
        text: "From Avakaya to mixed vegetable — our veg pickle range uses the same traditional methods.",
        ctaText: "Shop Veg Pickles",
        ctaHref: "/products?category=veg-pickles",
      },
    ],

    faqItems: [
      {
        question: "When is the best time to make Avakaya?",
        answer:
          "The traditional Avakaya season is April to June, when raw mangoes are at peak tartness and freshness. This is when the best-tasting Avakaya is made.",
      },
      {
        question: "What is the ratio of mustard to chilli in Avakaya?",
        answer:
          "Traditional Andhra Avakaya uses roughly equal weights of mustard powder and red chilli powder. However, each family tweaks this based on their spice preference.",
      },
      {
        question: "Why do some Avakaya recipes include the mango seed?",
        answer:
          "The mango seed kernel — once it softens during marination — absorbs the spices beautifully and adds a unique, slightly bitter flavor that dedicated Avakaya lovers especially enjoy.",
      },
    ],
  },

  // ── POST 5 ──────────────────────────────────────────────────────────────────
  {
    id: "5",
    slug: "best-non-veg-pickles-andhra-pradesh",
    status: "published",

    seoTitle: "Best Non-Veg Pickles in Andhra Pradesh — A Complete Guide",
    metaDescription:
      "Chicken, Gongura Chicken, Prawns, Mutton — Andhra's non-veg pickles are world-class. Discover the best varieties, how they're made, and where to buy online.",
    ogImage: null,
    canonicalPath: "/blog/best-non-veg-pickles-andhra-pradesh",

    title: "Best Non-Veg Pickles in Andhra Pradesh — A Complete Guide",
    excerpt:
      "Andhra Pradesh is famous for its fiery non-veg pickles. From Chicken to Prawns to Mutton — here's everything you need to know about the best non-veg pickles from the region.",
    category: "buying-guides",
    tags: ["non-veg pickles", "chicken pickle Andhra", "prawns pickle", "mutton pickle", "Andhra non-veg"],
    author: "naiduGari",
    publishedAt: "2025-03-20",
    updatedAt: "2025-05-01",
    readingTimeMinutes: 7,
    featured: true,
    featuredImage: {
      src: null,
      alt: "Selection of Andhra non-veg pickles — Chicken, Prawns, Mutton and Gongura Chicken",
      caption: "Andhra's finest non-veg pickles — bold, spicy, and absolutely addictive",
    },

    relatedProducts: [
      { name: "Chicken Pickle", slug: "chicken-pickle", category: "non-veg-pickles" },
      { name: "Gongura Chicken Pickle", slug: "gongura-chicken-pickle", category: "non-veg-pickles" },
      { name: "Prawns Pickle", slug: "prawns-pickle", category: "non-veg-pickles" },
      { name: "Mutton Pickle", slug: "mutton-pickle", category: "non-veg-pickles" },
    ],
    relatedCategories: [
      { name: "Non-Veg Pickles", path: "/products?category=non-veg-pickles" },
    ],
    relatedPosts: ["traditional-andhra-chicken-pickle-recipe", "why-gongura-pickle-is-famous"],

    articleSchema: {
      headline: "Best Non-Veg Pickles in Andhra Pradesh — A Complete Guide",
      description:
        "A guide to the best non-vegetarian pickles from Andhra Pradesh — including Chicken Pickle, Gongura Chicken Pickle, Prawns Pickle, and Mutton Pickle — with details on how they're made and tips for buying online.",
      keywords: "non-veg pickles Andhra, chicken pickle online, prawns pickle, mutton pickle, gongura chicken pickle",
    },

    contentBlocks: [
      {
        type: "intro",
        content:
          "When people think of Andhra food, the first thing that comes to mind is the heat — the legendary Guntur chilli that makes even seasoned spice-lovers sweat. And nowhere is this heat more celebrated than in Andhra's non-veg pickles. Slow-cooked in sesame oil with a masala of dry roasted spices, these pickles are unlike anything produced elsewhere in India. They're intensely flavored, deeply satisfying, and absolutely addictive.",
      },
      {
        type: "h2",
        content: "What Makes Andhra Non-Veg Pickles Special?",
      },
      {
        type: "paragraph",
        content:
          "The key difference between Andhra non-veg pickles and those from other regions is the method. Rather than simply marinating meat in spices, the Andhra method involves slow-cooking the protein in sesame oil with a rich, complex masala until almost all moisture is removed. This gives the pickle a concentrated, intense flavor and an impressively long shelf life — even without refrigeration.",
      },
      {
        type: "h2",
        content: "The Best Andhra Non-Veg Pickles",
      },
      {
        type: "h3",
        content: "1. Andhra Chicken Pickle",
      },
      {
        type: "paragraph",
        content:
          "The most popular non-veg pickle from Andhra, Chicken Pickle is made from bone-in country chicken (naati kodi) slow-cooked with Guntur chillies, sesame oil, garlic, and a blend of whole spices. The result is tender, deeply spiced chicken in a thick, flavorful masala. It works as a side dish with rice, a protein topping for dosas, or even as a quick meal on its own.",
      },
      {
        type: "internal-link-cta",
        text: "Shop Chicken Pickle →",
        href: "/product/chicken-pickle",
        productSlug: "chicken-pickle",
      },
      {
        type: "h3",
        content: "2. Gongura Chicken Pickle",
      },
      {
        type: "paragraph",
        content:
          "Gongura Chicken Pickle is arguably the most sought-after item from our kitchen. The tartness of fresh gongura (sorrel leaves) combined with the richness of slow-cooked chicken creates something truly extraordinary. The gongura is first sautéed until soft, then combined with fried chicken and spices — the result is a pickle that's tart, spicy, and deeply savory all at once.",
      },
      {
        type: "internal-link-cta",
        text: "Order Gongura Chicken Pickle →",
        href: "/product/gongura-chicken-pickle",
        productSlug: "gongura-chicken-pickle",
      },
      {
        type: "h3",
        content: "3. Prawns Pickle — A Coastal Andhra Specialty",
      },
      {
        type: "paragraph",
        content:
          "Prawns Pickle comes from the coastal districts of Andhra — particularly Kakinada, East Godavari, and Krishna. Fresh prawns are cleaned, lightly sun-dried, and then slow-cooked with a spicy masala in sesame oil. The umami from the seafood combined with the heat of Guntur chillies makes this one of the most complex and satisfying pickles in the Andhra repertoire. It's a must-try for seafood lovers.",
      },
      {
        type: "h3",
        content: "4. Mutton Pickle — Bold and Ceremonial",
      },
      {
        type: "paragraph",
        content:
          "Mutton Pickle is made during special occasions in many Andhra families — it's a labor-intensive product that uses premium cuts of mutton, slow-cooked for hours with whole spices and Guntur chillies until every piece is tender and infused with flavor. The resulting pickle is rich, hearty, and deeply aromatic. It pairs beautifully with rice and dal, or with curd rice for a classic combination.",
      },
      {
        type: "h2",
        content: "How to Choose Quality Non-Veg Pickles Online",
      },
      {
        type: "list",
        items: [
          "Look for small-batch makers — large factories compromise on quality and freshness",
          "Check for sesame oil as the primary oil — it's the authentic choice and a natural preservative",
          "Avoid products with artificial preservatives or MSG — authentic pickles don't need them",
          "Verify the protein source — bone-in country chicken vs broiler makes a huge difference in flavor",
          "Read reviews — look for customers who mention flavor depth, texture, and spice balance",
          "Freshness matters — check manufacture dates and ensure good shelf life remaining",
        ],
      },
      {
        type: "h2",
        content: "Storage and Serving Tips",
      },
      {
        type: "paragraph",
        content:
          "Store non-veg pickles in a cool, dry place away from direct sunlight. Always use a dry, clean spoon. Once opened, consume within 2–3 months for best flavor (though they'll last longer). Refrigeration is optional but recommended in very hot and humid climates. For the best experience, bring the pickle to room temperature before serving — the sesame oil will loosen and the flavors will be at their best.",
      },
      {
        type: "cta-block",
        heading: "Order Authentic Andhra Non-Veg Pickles",
        text: "All made fresh, in small batches, with zero preservatives. Pan-India delivery.",
        ctaText: "Shop All Non-Veg Pickles",
        ctaHref: "/products?category=non-veg-pickles",
      },
    ],

    faqItems: [
      {
        question: "Which Andhra non-veg pickle is the most popular?",
        answer:
          "Chicken Pickle and Gongura Chicken Pickle are both extremely popular. Chicken Pickle is the gateway — most people start with it and then explore Gongura Chicken and Prawns Pickle.",
      },
      {
        question: "How long do non-veg pickles last without refrigeration?",
        answer:
          "Authentic Andhra non-veg pickles made with sesame oil and proper salt ratios last 3–6 months without refrigeration when stored in a cool, dry place. Refrigeration after opening extends this further.",
      },
      {
        question: "Are non-veg pickles halal?",
        answer:
          "Our chicken and mutton pickles are made with halal-certified meat. Please check product descriptions or contact us for specific certification details.",
      },
      {
        question: "Can I gift non-veg pickles?",
        answer:
          "Absolutely! Our pickles come in hygienic, tamper-proof packaging and are excellent gifts for food lovers. We also offer curated gift boxes — contact us for details.",
      },
    ],
  },
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

/** Get all published posts sorted by date (newest first) */
export function getPublishedPosts() {
  return BLOG_POSTS.filter((p) => p.status === "published").sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

/** Get featured posts */
export function getFeaturedPosts(limit = 3) {
  return getPublishedPosts()
    .filter((p) => p.featured)
    .slice(0, limit);
}

/** Get a single post by slug */
export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug && p.status === "published") || null;
}

/** Get related posts for a given post */
export function getRelatedPosts(post, limit = 3) {
  if (!post.relatedPosts?.length) return [];
  return post.relatedPosts
    .map((slug) => getPostBySlug(slug))
    .filter(Boolean)
    .slice(0, limit);
}

/** Get posts by category slug */
export function getPostsByCategory(categorySlug, limit = 10) {
  return getPublishedPosts()
    .filter((p) => p.category === categorySlug)
    .slice(0, limit);
}

/** Format date for display */
export function formatBlogDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Get category label from slug */
export function getCategoryLabel(slug) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
