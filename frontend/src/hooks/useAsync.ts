"use client";

import { useCallback, useState } from "react";

export function useAsync<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (promiseFactory: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await promiseFactory();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, run };
}
