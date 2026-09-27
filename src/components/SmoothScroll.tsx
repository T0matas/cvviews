"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 0.55,
      lerp: 0.22,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      respectReducedMotion: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return children;
}
