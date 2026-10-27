import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Safely register plugins in client environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Default animations configuration according to GSAP best practices
  gsap.defaults({
    ease: "power2.out",
    duration: 0.5,
  });
}

export { gsap, ScrollTrigger };

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface UseGSAPConfig {
  scope?: React.RefObject<Element | null> | Element | null;
  dependencies?: any[];
  revertOnUpdate?: boolean;
}

/**
 * Custom useGSAP hook implementing the official GSAP React architecture:
 * - Scoped selectors
 * - Automatic cleanup via gsap.context()
 * - SSR safety
 * - Accessibility / prefers-reduced-motion support
 */
export function useGSAP(
  callback: (context: gsap.Context) => void | (() => void),
  config: UseGSAPConfig | any[] = {}
) {
  const isConfigArray = Array.isArray(config);
  const dependencies = isConfigArray ? config : config.dependencies || [];
  const scope = isConfigArray ? undefined : config.scope;
  const revertOnUpdate = isConfigArray ? false : config.revertOnUpdate ?? true;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const resolvedScope =
      scope && "current" in (scope as any)
        ? (scope as React.RefObject<Element | null>).current
        : (scope as Element | null | undefined);

    let cleanupFn: void | (() => void);

    const ctx = gsap.context((self) => {
      // Respect prefers-reduced-motion
      const mm = gsap.matchMedia();
      mm.add(
        {
          reducedMotion: "(prefers-reduced-motion: reduce)",
          standard: "(prefers-reduced-motion: no-preference)",
        },
        (matchContext) => {
          if (matchContext.conditions?.reducedMotion) {
            // Under reduced motion, complete animations or disable motion
            gsap.globalTimeline.timeScale(100);
          } else {
            gsap.globalTimeline.timeScale(1);
          }
          cleanupFn = callbackRef.current(self);
        },
        resolvedScope || undefined
      );
    }, resolvedScope || undefined);

    return () => {
      if (typeof cleanupFn === "function") {
        cleanupFn();
      }
      ctx.revert();
    };
  }, dependencies);
}

/**
 * Trigger ScrollTrigger recalculation safely after dynamic content / layout changes
 */
export function refreshScrollTrigger(delayMs = 150) {
  if (typeof window === "undefined") return;
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, delayMs);
}

/**
 * Standard GSAP Fade-Up entrance for individual cards or components
 */
export function gsapFadeUp(
  target: gsap.DOMTarget,
  vars: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.fromTo(
    target,
    { autoAlpha: 0, y: vars.y ?? 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: vars.duration ?? 0.6,
      ease: vars.ease ?? "power3.out",
      clearProps: "transform,opacity,visibility",
      ...vars,
    }
  );
}

/**
 * Standard GSAP Stagger Entrance for arrays of cards, chips or list items
 */
export function gsapStagger(
  targets: gsap.DOMTarget,
  vars: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.fromTo(
    targets,
    { autoAlpha: 0, y: vars.y ?? 20 },
    {
      autoAlpha: 1,
      y: 0,
      duration: vars.duration ?? 0.5,
      stagger: vars.stagger ?? 0.08,
      ease: vars.ease ?? "power2.out",
      clearProps: "transform,opacity,visibility",
      ...vars,
    }
  );
}

/**
 * Standard GSAP Scroll-Triggered batch reveal for grids and lists
 */
export function gsapBatchReveal(
  targets: gsap.DOMTarget,
  options: {
    start?: string;
    stagger?: number;
    y?: number;
    once?: boolean;
    duration?: number;
  } = {}
) {
  if (typeof window === "undefined") return;

  return ScrollTrigger.batch(targets, {
    start: options.start ?? "top 88%",
    once: options.once ?? true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: options.y ?? 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: options.duration ?? 0.6,
          stagger: options.stagger ?? 0.09,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "transform,opacity,visibility",
        }
      );
    },
  });
}
