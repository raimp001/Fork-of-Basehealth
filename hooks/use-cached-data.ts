"use client"

import { useState, useEffect } from "react"

type CacheOptions = {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean // Whether to return stale data while fetching fresh data
}

const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
}

type CacheEntry<T> = {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()

export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  const fetchData = async (skipCache = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check cache first if not skipping cache
      if (!skipCache) {
        const cachedEntry = cache.get(key)
        const now = Date.now()

        if (cachedEntry) {
          const isStale = now - cachedEntry.timestamp > (mergedOptions.ttl || 0)

          // If not stale or using stale while revalidate, return cached data
          if (!isStale || mergedOptions.staleWhileRevalidate) {
            setData(cachedEntry.data)
            setIsLoading(false)

            // If stale and using stale while revalidate, fetch in background
            if (isStale && mergedOptions.staleWhileRevalidate) {
              fetchData(true) // Skip cache on revalidation
            }

            return
          }
        }
      }

      // Fetch fresh data
      const freshData = await fetchFn()
      setData(freshData)

      // Update cache
      cache.set(key, {
        data: freshData,
        timestamp: Date.now(),
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const refetch = async () => {
    await fetchData(true)
  }

  return { data, isLoading, error, refetch }
}
