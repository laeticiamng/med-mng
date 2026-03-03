/**
 * 🛡️ Console Clean Smoke Test
 * Vérifie qu'aucun warning "forwardRef" n'apparaît lors du rendu de l'App.
 * Empêche la régression des fixes appliqués sur AppFooter, SEOHead, etc.
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

describe("Console Clean — forwardRef warnings", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Polyfill missing performance methods in jsdom
    if (!window.performance.getEntriesByType) {
      (window.performance as any).getEntriesByType = vi.fn(() => []);
    }
    if (!window.performance.getEntriesByName) {
      (window.performance as any).getEntriesByName = vi.fn(() => []);
    }

    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not emit any forwardRef warning when rendering App", () => {
    render(<App />);

    const forwardRefWarnings = warnSpy.mock.calls.filter((args) =>
      args.some(
        (arg) =>
          typeof arg === "string" &&
          (arg.includes("Function components cannot be given refs") ||
            arg.includes("forwardRef"))
      )
    );

    expect(forwardRefWarnings).toHaveLength(0);
  });
});
