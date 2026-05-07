import { useEffect, useState } from "react";
import { getCombosAPI } from "../api/combo.api";
import ComboCard from "../components/combo/ComboCard";
import { PageLoader } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

const CombosPage = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getCombosAPI();
        if (!cancelled) setCombos(data?.data?.combos ?? []);
      } catch (err) {
        if (!cancelled) setError("Failed to load combos. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} />;

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 text-xs font-body text-earth-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <span className="hover:text-brand-600 transition-colors cursor-pointer">
        Home
      </span>

      <span>/</span>

      <span className="text-earth-700 font-semibold">
        Combos
      </span>
    </nav>

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-display font-bold text-earth-900">
        Combo Offers
      </h1>

      <p className="text-earth-500 mt-2 font-body max-w-2xl">
        Save more with our handpicked combo deals — curated for every taste.
      </p>
    </div>

    {combos.length === 0 ? (
      <EmptyState
        title="No Combos Available"
        message="We're preparing exciting combo deals. Check back soon!"
        icon="🎁"
      />
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {combos.map((combo) => (
          <ComboCard key={combo._id} combo={combo} />
        ))}
      </div>
    )}
  </div>
);
};

export default CombosPage;
