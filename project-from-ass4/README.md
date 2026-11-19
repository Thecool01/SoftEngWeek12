# Smart Campus Room Availability Checker

A single-page web application that helps students and staff find a campus room that fits their group, has the equipment they need, and is free for a chosen time slot.

## Project Overview

The Smart Campus Room Availability Checker lets a user:

- **Select a room** from the campus room list, which shows each room's building, capacity, equipment, and blocked status.
- **Filter by capacity** by entering the number of attendees. Only rooms large enough for the group are shown.
- **Filter by equipment** by selecting one or more items (for example Wi-Fi or Projector). Only rooms that have **all** selected items are shown.
- **Check availability** for a start and end time. The result states whether the selected room is free, and explains why not if it is not.

The availability rules are:

- The interval must start after the current time, which is fixed at 12:00 in this version.
- The interval must end on the same day and be no longer than 120 minutes.
- Intervals may touch an existing booking at its start or end, but may not overlap one.
- Blocked rooms are never available.

Each selected room shows its existing bookings, so the user can see why a time slot is or is not free.

## Prerequisites

- **Node.js:** a version that satisfies the test library's requirement, which is one of the following:
  - 22.22.2 or newer in the 22 line
  - 24.15.0 or newer in the 24 line
  - 26 or newer

  The build tool (Vite 5) requires Node.js 18 or 20 or newer, so these versions also satisfy it. The project does not declare an `engines` field or a `.nvmrc` file.
- **npm:** version 7 or newer. The project's `package-lock.json` uses lockfile format version 3, which npm 7 introduced. npm bundled with the Node.js versions above is sufficient.

To check your versions, run:

```bash
node --version
npm --version
```

## Installation

From the project folder, run:

```bash
npm install
```

To install the exact versions recorded in `package-lock.json`, run `npm ci` instead.

## Running Locally

Start the development server with:

```bash
npm run dev
```

Vite prints a **Local** address in the terminal, usually `http://localhost:5173/`. Open that address in your browser. The port is not set in the project configuration, so if 5173 is busy Vite chooses another port and prints it instead.

Press `Ctrl+C` in the terminal to stop the server.

To preview the production build, run `npm run build` first, then:

```bash
npm run preview
```

## Running Tests

Run all automated tests once:

```bash
npm test
```

This runs the Vitest test suite (6 test files, 50 tests). It includes unit tests for the availability and filtering rules, integration tests that use the real room data, and React interface tests that render the application.

Other checks:

```bash
npm run typecheck
```

Runs the TypeScript type checker against the application source.

```bash
npm run build
```

Creates a production build in the `dist` folder.

```bash
npm run lint
```

Runs ESLint over the project.

## Project Structure

```
index.html                  Browser entry page
src/
  main.tsx                  Starts the React application
  App.tsx                   Main screen: holds the filter, time, and selected-room state
  App.test.tsx              Interface tests that render the real application
  index.css                 Global styles (Tailwind CSS)
  vite-env.d.ts             Type declarations for Vite
  data/
    rooms.ts                Fictional rooms, equipment, blocked status, and bookings
  lib/
    availability.ts         Booking rules: valid interval, 120-minute limit, blocked rooms, overlap detection
    roomFilter.ts           Capacity and equipment filtering, attendee parsing, equipment options
    time.ts                 Time formatting and conversion (minutes, HH:MM)
    *.test.ts               Unit and integration tests for the lib modules
  components/
    RoomFilterPanel.tsx     Attendee and equipment inputs
    RoomList.tsx            Room cards for the filtered rooms
    ClearFiltersButton.tsx  Resets the attendee and equipment filters
    TimeField.tsx           Start and end time input
    AvailabilityResultPanel.tsx  Shows Available or Unavailable with the reason
    RoomBookingsCard.tsx    Lists the selected room's bookings
package.json                Project scripts and dependencies
vite.config.ts              Vite setup, including the @ alias for the src folder
vitest.config.ts            Test setup (Node environment, JSX setting, @ alias)
tsconfig*.json              TypeScript configuration
eslint.config.js            ESLint configuration
tailwind.config.js          Tailwind CSS configuration
```

## Application Scope

- The application uses **fictional room and booking data** defined in `src/data/rooms.ts`. It contains four rooms: A101, B220, C310 (blocked), and D105.
- The current time is **fixed at 12:00** for every check.
- Availability checks **do not change** any booking data, and nothing is saved between sessions.
- The application **does not require a database, authentication, or external APIs**. The Supabase client library is listed in `package.json`, but the current source code does not use it.
- The layout is designed to be responsive across phone, tablet, and desktop screens. Responsive behavior is not verified by the automated tests.

## Setting Up on a New Computer

1. Install a Node.js version listed under Prerequisites.
2. Copy the project folder to the computer.
3. Open a terminal in the project folder.
4. Run `npm install`.
5. Run `npm run dev`, then open the Local address shown in the terminal.
6. Optionally, run `npm test`, `npm run typecheck`, `npm run build`, and `npm run lint` to confirm the project is working.
