

# Run all unit tests to verify zero regressions

## What to do

Execute the full test suite to confirm the `forwardRef` fixes in `ThemeToggle` and `StickyMobileCTA` haven't introduced any regressions.

## Tests to run

Run all test files matching `src/**/*.{test,spec}.{ts,tsx}`:

1. `src/test/console-clean.test.tsx` — smoke test for forwardRef warnings
2. `src/test/smoke.test.ts` — platform smoke tests
3. `src/tests/hooks/useIdGenerator.test.ts` — ID generator unit tests
4. `src/tests/hooks/useFlashcards.test.ts` — flashcards hook tests
5. `src/tests/hooks/useMusicGeneration.test.ts` — music generation hook tests

## Expected result

All tests pass green, confirming no regression from the latest `forwardRef` wrapping changes.

