"use client";

import { useEffect, useRef } from "react";

export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const element = ref.current as HTMLDivElement | null;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => callbackRef.current(entries),
      optionsRef.current
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
