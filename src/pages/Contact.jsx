import { useSEO, SITE_URL } from "../hooks/useSEO";

const Contact = () => {
  useSEO({
    title: "Contact Us — Naidu Gari Ruchulu",
    description:
      "Get in touch with Naidu Gari Ruchulu for order support, bulk enquiries or feedback. Phone, email and WhatsApp support available Mon–Sat.",
    canonical: `${SITE_URL}/contact`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ],
  });

  return (
    <div className="page-container py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <p className="mb-4">
        We'd love to hear from you! Reach out for any questions or support.
      </p>

      <p>
        <strong>Phone:</strong> +91 90523 55733
      </p>
      <p>
        <strong>Email:</strong> support@naidugariruchulu.com
      </p>

      <p className="mt-4">
        <strong>Working Hours:</strong> Mon – Sat, 9:00 AM – 6:00 PM
      </p>
    </div>
  );
};

export default Contact;
