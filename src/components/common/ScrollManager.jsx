import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = {};

const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const key = location.pathname + location.search;

    // Restore scroll if coming from back/forward
    if (navigationType === "POP" && scrollPositions[key]) {
      window.scrollTo({
        top: scrollPositions[key],
        behavior: "auto",
      });
    } else {
      // New navigation → go to top
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }

    // Save scroll position before leaving
    return () => {
      scrollPositions[key] = window.scrollY;
    };
  }, [location, navigationType]);

  return null;
};

export default ScrollManager;