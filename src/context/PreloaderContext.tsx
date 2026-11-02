"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface PreloaderContextType {
  /** True while the preloader is actively showing, false once it lifts */
  isPreloading: boolean;
  /** True once the site is fully ready and animations are unleashed */
  isSiteReady: boolean;
  /** Manually trigger ready state */
  markSiteReady: () => void;
}

const PreloaderContext = createContext<PreloaderContextType>({
  isPreloading: true,
  isSiteReady: false,
  markSiteReady: () => {},
});

export const PreloaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreloading, setIsPreloading] = useState<boolean>(true);
  const [isSiteReady, setIsSiteReady] = useState<boolean>(false);

  const markSiteReady = useCallback(() => {
    setIsPreloading(false);
    setIsSiteReady(true);
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("is-preloading");
      document.documentElement.classList.add("site-ready");
      (window as any).__SITE_READY__ = true;
      window.dispatchEvent(new CustomEvent("siteready"));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).__SITE_READY__ || document.documentElement.classList.contains("site-ready")) {
        setIsPreloading(false);
        setIsSiteReady(true);
      } else {
        const onReady = () => {
          setIsPreloading(false);
          setIsSiteReady(true);
        };
        window.addEventListener("siteready", onReady, { once: true });

        // Safety fallback: ensure animations never stay frozen indefinitely
        const fallbackTimer = setTimeout(() => {
          if (document.documentElement.classList.contains("is-preloading")) {
            markSiteReady();
          }
        }, 3500);

        return () => {
          window.removeEventListener("siteready", onReady);
          clearTimeout(fallbackTimer);
        };
      }
    }
  }, [markSiteReady]);

  return (
    <PreloaderContext.Provider value={{ isPreloading, isSiteReady, markSiteReady }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloader = () => useContext(PreloaderContext);
export const useSiteReady = () => useContext(PreloaderContext).isSiteReady;
export default PreloaderContext;
