import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // or "auto" if you want instant
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;