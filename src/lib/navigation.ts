// SPA-first navigation, with window fallback
import type { To, NavigateOptions } from "react-router-dom";

type NavFn = (to: To, opts?: NavigateOptions) => void;

let _navigate: NavFn | null = null;

export function setNavigate(fn: NavFn) {
  _navigate = fn;
}

export function appNavigate(to: To, opts?: NavigateOptions) {
  if (_navigate) return _navigate(to, opts);

  // Fallback sans Router (Storybook, tests, providers globaux…)
  if (typeof window !== "undefined") {
    if (typeof to === "string") return (window.location.href = to);
    const path =
      (to as any)?.pathname ?? "/" +
      ((to as any)?.search ?? "") +
      ((to as any)?.hash ?? "");
    window.location.href = path;
  }
}