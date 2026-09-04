"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigateFn = (href: string) => void;

const TransitionContext = createContext<NavigateFn>(() => {});

/** Use inside any client component to navigate with the page-wipe transition. */
export function usePageTransition(): NavigateFn {
  return useContext(TransitionContext);
}

/**
 * Wraps the app in a full-screen overlay that fades in on internal navigation,
 * then triggers router.push, then fades out when the new route mounts.
 * Falls back to instant navigation on reduced-motion and unsupported browsers.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      let normalized: string | null = null;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathname) return;
        normalized = url.pathname + url.search + url.hash;
      } catch {
        return;
      }

      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        void router.push(normalized);
        return;
      }

      setFading(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void router.push(normalized!);
      }, 150);
    },
    [pathname, router]
  );

  // When the new route mounts, fade the overlay back out.

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    const id = setTimeout(() => setFading(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  // Intercept every internal <a> click and route via the wipe.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      let ok = false;
      try {
        const url = new URL(href, window.location.origin);
        ok = url.origin === window.location.origin && url.pathname !== pathname;
      } catch {
        ok = false;
      }
      if (!ok) return;

      e.preventDefault();
      navigate(href);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [navigate, pathname]);

  return (
    <TransitionContext.Provider value={navigate}>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-slate-950 transition-opacity duration-150 ${
          fading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      {children}
    </TransitionContext.Provider>
  );
}