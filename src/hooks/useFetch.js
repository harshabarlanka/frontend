import { useState, useEffect, useRef, useCallback } from "react";

// In-memory cache for GET requests (keyed by URL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * useFetch — data fetching hook with:
 * - AbortController cleanup on unmount / key change
 * - In-memory cache (5-min TTL)
 * - Loading / error state management
 *
 * @param {Function|null} fetchFn - async function that returns axios response
 * @param {any[]} deps - dependency array (re-fetches when these change)
 * @param {object} options
 * @param {boolean} [options.skip] - skip the fetch when true (e.g. !user)
 * @param {string}  [options.cacheKey] - unique key for caching
 */
export function useFetch(fetchFn, deps = [], { skip = false, cacheKey = null } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const refetch = useCallback(async () => {
    if (skip || !fetchFn) {
      setLoading(false);
      return;
    }

    // Check cache
    if (cacheKey && cache.has(cacheKey)) {
      const { value, ts } = cache.get(cacheKey);
      if (Date.now() - ts < CACHE_TTL) {
        setData(value);
        setLoading(false);
        return;
      }
      cache.delete(cacheKey);
    }

    // Abort previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn({ signal: abortRef.current.signal });
      const value = result?.data?.data ?? result?.data ?? result;
      setData(value);
      if (cacheKey) cache.set(cacheKey, { value, ts: Date.now() });
    } catch (err) {
      if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
        setError(err?.response?.data?.message || err?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, skip, cacheKey]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch };
}

export default useFetch;
