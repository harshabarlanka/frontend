import { useState, useEffect, useCallback } from 'react'

const useFetch = (fetchFn, deps = [], options = {}) => {
  const { immediate = true, initialData = null } = options
  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn(...args)
      setData(result.data?.data ?? result.data)
      return result
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { if (immediate) execute() }, [immediate])

  return { data, loading, error, refetch: execute }
}

export default useFetch
