import { useState, useEffect, useCallback, useRef } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("useFetch error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}

export function useMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  options?: {
    onSuccess?: (result: TResult) => void;
    onError?: (err: Error) => void;
  }
) {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (input: TInput) => {
    setIsPending(true);
    try {
      const result = await mutationFn(input);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}