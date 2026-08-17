# key-checkin-signout — Demo Tool

This repository contains a demo Next.js application (key-checkin-signout) used for demonstrating a simple check-in / check-out flow.

Prerequisites
- Node.js (recommended: 18.x or later). Newer Node versions are generally supported; use an LTS release.
- npm (bundled with Node) or yarn/pnpm if preferred.
- Git (optional, for cloning or version control).

Getting started
1. Open a terminal (PowerShell or Command Prompt).
2. Clone or change to the project folder
3. Install dependencies:

   npm install

   (Or `yarn` / `pnpm install` if you prefer those package managers.)

4. Run the development server:

   npm run dev

   The app will start in development mode (Next.js) and by default listens on http://localhost:3000.

Build and production
- Build for production:

  npm run build

- Start the production server (after building):

  npm run start

Linting
- Run linter configured in the project:

  npm run lint

Notes about the project
- Framework: Next.js (see [package.json](C:/Users/oscar/OneDrive/Desktop/InterviewProblem/key-checkin-signout/package.json)).
- UI libraries and tooling: project depends on React, Next.js, Tailwind-related packages and design system packages used by the demo.
- TypeScript: devDependencies include TypeScript and @types packages; the project may already be set up for TypeScript.

Environment variables
- This demo app does not require any enviroment varibles so the creation of a `.env` file is not needed

Ports and URLs
- Development: http://localhost:3000 (default Next.js port). If that port is in use, Next will prompt to use another port.

Troubleshooting
- "Cannot find module" or missing packages: re-run `npm install` inside `key-checkin-signout`.
- Node version issues: use a Node version manager (nvm-windows, nvs) to switch to Node 18+.
- Lint errors: run `npm run lint` and follow the output to fix issues.
- Build errors: read the stack trace shown by `npm run build`.