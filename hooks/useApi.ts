import { useState, useCallback } from "react";
import { getErrorMessage } from "@/lib/utils";

type UseApiOptions = {
  silent?: boolean;
};

export function useApi<T, A extends unknown[] = []>(
  fn: (...args: A) => Promise<T>,
  opts?: UseApiOptions,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: A): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (err) {
        const msg = getErrorMessage(err);
        if (!opts?.silent) setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn, opts?.silent],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
