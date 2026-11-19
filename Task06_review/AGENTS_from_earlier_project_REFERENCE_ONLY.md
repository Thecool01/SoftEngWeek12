# Smart Campus — Agent Instructions

## Project Purpose

A Smart Campus room availability checker that allows students to select a room, enter a time interval, and check availability using fictional booking data.

## Project Structure

- `src/lib/availability.ts` — pure booking validation logic and constants.
- `src/App.tsx` — responsive user interface.
- `src/data/rooms.ts` — fictional room and booking fixtures.
- `src/lib/availability.test.ts` — regression tests.
- `vitest.config.ts` — test configuration.

## Acceptance Criteria

- **AC1:** Reject invalid intervals and requests that start at or before the current time.
- **AC2:** Reject booking durations greater than 120 minutes.
- **AC3:** Reject blocked rooms.
- **AC4:** Reject overlapping bookings; allow touching endpoints.
- **AC5:** Availability checks must not mutate existing booking data.
- **AC6:** Preserve clear desktop and mobile UI feedback.

## Engineering Rules

- Prefer minimal, behavior-preserving changes.
- Use at most two design patterns, only when justified.
- Reuse existing constants instead of duplicating hard-coded values.
- Keep booking validation separate from UI logic.
- Never mutate fixture data during availability checks.
- Do not remove or weaken existing test assertions.

## Commands

- `npm test` — run Vitest tests.
- `npm run typecheck` — check TypeScript.
- `npm run lint` — check code quality.
- `npm run build` — verify production build.

## Forbidden Scope Changes

- Do not add authentication, a backend, or a database.
- Do not implement persistent booking creation.
- Do not change the existing UI design.
- Do not remove existing room selection, filtering, or availability features.
- Do not change the booking acceptance criteria.
- Do not introduce unnecessary classes, dependencies, or abstractions.

## Verification

Before and after refactoring:

- Run the existing tests.
- Verify that AC1–AC5 still pass.
- Check desktop and mobile UI behavior for AC6.
- Report modified files, test results, and any remaining limitations.
