import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CategoryRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    if (category) {
      navigate(`/products/${category}`, { replace: true });
    } else {
      navigate("/products/all", { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default CategoryRedirect;