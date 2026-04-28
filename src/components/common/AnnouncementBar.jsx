import { useEffect, useState } from "react";

const messages = [
  "🚚 Free Shipping on orders above ₹999",
  "⏱ Delivery in 5–7 days across India",
  "🎁 Use code WELCOME10 for 10% OFF",
];

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000); // change every 3 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#C48A3A] text-white text-xs sm:text-sm py-2 text-center font-medium tracking-wide transition-all duration-500">
      {messages[index]}
    </div>
  );
};

export default AnnouncementBar;
