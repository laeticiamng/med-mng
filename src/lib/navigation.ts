// SPA-first navigation, with safe window fallback
import { isBrowser } from './environment';
import type { To, NavigateOptions } from "react-router-dom";

type NavFn = (to: To, opts?: NavigateOptions) => void;

let _navigate: NavFn | null = null;

export function setNavigate(fn: NavFn) {
  _navigate = fn;
}

export function appNavigate(to: To, opts?: NavigateOptions) {
  if (_navigate) return _navigate(to, opts);

  // Fallback sans Router (tests, Storybook, providers globaux…)
  if (isBrowser()) {
    if (typeof to === "string") {
      window.location.href = to;
      return;
    }
    const t = to as any;
    // ⚠️ Evite la priorité hasardeuse de ?? avec +
    const pathname = t?.pathname ?? "/";
    const search = t?.search ?? "";
    const hash = t?.hash ?? "";
    window.location.href = `${pathname}${search}${hash}`;
  }
}