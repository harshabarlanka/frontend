import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Persists scroll positions across navigations (module-level, never reset).
const scrollPositions = {};

const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevKeyRef = useRef(null);

  // useLayoutEffect fires synchronously after DOM mutations but BEFORE the
  // browser paints. This means the scroll is set before the user ever sees
  // the new page, eliminating the "flash of wrong scroll position" that
  // useEffect causes (which runs after paint).
  useLayoutEffect(() => {
    const key = location.pathname + location.search;

    // Save scroll for the page we're leaving, keyed to its exact URL.
    if (prevKeyRef.current) {
      scrollPositions[prevKeyRef.current] = window.scrollY;
    }
    prevKeyRef.current = key;

    // /products must always start at the top — including back/forward —
    // because query params (category, sort, page) represent filter state,
    // not true browser-history scroll positions worth restoring.
    const isProductsPage = location.pathname === "/products";

    if (
      !isProductsPage &&
      navigationType === "POP" &&
      scrollPositions[key] != null
    ) {
      window.scrollTo({ top: scrollPositions[key], behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location, navigationType]);

  return null;
};

export default ScrollManager;
