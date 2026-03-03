/**
 * 🛡️ Console Clean Smoke Test
 * Vérifie qu'aucun warning "forwardRef" n'apparaît lors du rendu de l'App.
 * Empêche la régression des fixes appliqués sur AppFooter, SEOHead, etc.
 *
 * Couvre les actions 6–7 du plan anti-régression forwardRef.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

// Mock web-vitals (uses performance APIs not available in jsdom)
vi.mock("web-vitals", () => ({
  onCLS: vi.fn(),
  onFID: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
}));

// Mock Sentry
vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
  ErrorBoundary: ({ children }: any) => children,
  withProfiler: (c: any) => c,
}));

import App from "@/App";

/**
 * Patterns qui indiquent un warning forwardRef dans React.
 * Si l'un d'eux apparaît dans console.warn OU console.error, le test échoue.
 */
const FORWARD_REF_PATTERNS = [
  "Function components cannot be given refs",
  "forwardRef",
  "Check the render method of",
  "did you mean to use React.forwardRef",
];

function containsForwardRefWarning(args: any[]): boolean {
  return args.some(
    (arg) =>
      typeof arg === "string" &&
      FORWARD_REF_PATTERNS.some((pattern) => arg.includes(pattern))
  );
}

describe("Console Clean — forwardRef warnings", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Polyfill missing performance methods in jsdom
    if (!window.performance.getEntriesByType) {
      (window.performance as any).getEntriesByType = vi.fn(() => []);
    }
    if (!window.performance.getEntriesByName) {
      (window.performance as any).getEntriesByName = vi.fn(() => []);
    }

    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not emit any forwardRef warning when rendering App", () => {
    render(<App />);

    const warnMatches = warnSpy.mock.calls.filter(containsForwardRefWarning);
    const errorMatches = errorSpy.mock.calls.filter(containsForwardRefWarning);

    expect(
      warnMatches,
      `Found ${warnMatches.length} forwardRef warning(s) in console.warn`
    ).toHaveLength(0);

    expect(
      errorMatches,
      `Found ${errorMatches.length} forwardRef error(s) in console.error`
    ).toHaveLength(0);
  });
});
