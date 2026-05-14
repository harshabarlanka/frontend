import { useEffect, useState, memo } from "react";

const messages = [
  "🚚 Free Shipping on orders above ₹999",
  "⏱ Delivery in 5–7 days across India",
  "🎁 Use code WELCOME10 for 10% OFF",
];

/**
 * AnnouncementBar — cycles through promotional messages every 4s.
 * Uses CSS transitions instead of JS re-renders for smooth fade.
 * aria-live="polite" ensures screen readers announce each change.
 */
const AnnouncementBar = memo(() => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      // Fade out → swap text → fade in (avoids layout shift)
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="w-full bg-[#C48A3A] text-white text-xs sm:text-sm py-2 text-center font-medium tracking-wide"
      role="region"
      aria-label="Promotions and announcements"
    >
      <p
        aria-live="polite"
        aria-atomic="true"
        className="transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {messages[index]}
      </p>
    </div>
  );
});

AnnouncementBar.displayName = "AnnouncementBar";
export default AnnouncementBar;
