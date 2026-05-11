import { useSEO, SITE_URL } from "../hooks/useSEO";

const FAQ_ITEMS = [
  {
    question: "Are your products homemade?",
    answer:
      "Yes, all our products are prepared using traditional family recipes passed down through generations. Every batch is made fresh in small quantities to ensure quality and authenticity.",
  },
  {
    question: "Do you use preservatives in your pickles?",
    answer:
      "No. We use natural ingredients and traditional preservation methods — primarily oil, salt, and natural spices. No artificial preservatives or additives are used.",
  },
  {
    question: "How long do the pickles last?",
    answer:
      "Our pickles last 6–12 months when stored in a cool, dry place away from sunlight. Once opened, refrigerate and consume within 3 months. Always use a dry spoon.",
  },
  {
    question: "Do you deliver across India?",
    answer:
      "Yes, we offer pan-India delivery via reliable courier partners. Delivery typically takes 3–7 business days depending on your location.",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "We take great care in packaging, but if your order arrives damaged, please contact us within 24 hours with photographs of the damaged product. We will arrange a replacement or refund.",
  },
  {
    question: "What is the minimum order value for free shipping?",
    answer:
      "We offer free shipping on orders above ₹999. Orders below ₹999 may attract a nominal shipping fee based on your location.",
  },
  {
    question: "Can I return or cancel my order?",
    answer:
      "Since our products are perishable food items, we do not accept returns except for damaged or incorrect items. Order cancellations can be made within 2 hours of placing the order.",
  },
  {
    question: "Are your non-veg pickles fresh or frozen?",
    answer:
      "All our non-veg pickles (chicken, prawn, mutton, fish) are prepared fresh and preserved using traditional oil and spice methods. They are never frozen.",
  },
];

const FAQ = () => {
  useSEO({
    title: "Frequently Asked Questions — Andhra Homemade Pickles",
    description:
      "Got questions about Naidu Gari Ruchulu? Find answers about our homemade pickles, delivery, shelf life, ingredients, returns and more.",
    canonical: `${SITE_URL}/faq`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "FAQ", url: "/faq" },
    ],
    faqItems: FAQ_ITEMS,
  });

  return (
    <div className="page-container py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-earth-500 mb-8">
        Everything you need to know about our products, ordering and delivery.
      </p>

      <div className="space-y-6">
        {FAQ_ITEMS.map((item, idx) => (
          <details
            key={idx}
            className="group border border-earth-200 rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer font-semibold text-earth-800 hover:bg-earth-50 transition-colors list-none">
              <h2 className="text-base font-semibold">{item.question}</h2>
              <span className="shrink-0 text-brand-600 group-open:rotate-180 transition-transform duration-200">
                ▼
              </span>
            </summary>
            <div className="px-6 pb-5 pt-2 text-earth-600 leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
