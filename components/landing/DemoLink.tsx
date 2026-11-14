"use client";

import type { MouseEvent, ReactNode } from "react";

// A plain "#demo" anchor that works without JS. With JS it scrolls smoothly
// (unless the visitor prefers reduced motion) and moves keyboard focus to the section.
export default function DemoLink({ className, children }: { className?: string; children: ReactNode }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("demo");
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }

  return (
    <a href="#demo" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
