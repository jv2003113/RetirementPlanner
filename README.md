# Retire Easy UI

The modern, responsive frontend for the Retire Easy platform, built to help users visualize and plan their financial future.

## 🚀 Tech Stack

- **Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **State Management:** [TanStack Query](https://tanstack.com/query/latest)
- **Routing:** [Wouter](https://github.com/molefrog/wouter)
- **Charts:** [Recharts](https://recharts.org/)
- **Form Handling:** React Hook Form + Zod

## 🛠️ Project Structure

- `client/src/pages`: Main view routes (Dashboard, Profile, RetirementPlan, etc.)
- `client/src/components`:
    - `ui`: Reusable UI primitives (Buttons, Inputs, etc.)
    - `auth`: Login/Signup forms
    - `layout`: Sidebar, MobileNav
- `client/src/contexts`: Global state (AuthContext)
- `client/src/lib`: Utilities (API helpers, Shadcn utils)
- `server`: Minimal Express server for serving the frontend and proxying API requests in dev.

## 🏁 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- `reazy-api` running locally on port 3001

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```
The app will be available at `http://localhost:4000`.
Requests to `/api/*` are proxied to the backend at `http://localhost:3001`.

### Building for Production

```bash
npm run build
```

This compiles the React app and the lightweight serving layer into `dist/`.

## 🧪 Key Features

- **Auth:** Secure login/signup flow with persistent sessions.
- **Retirement Visualization:** Interactive charts and projections.
- **Responsive Design:** Optimized for both desktop and mobile users.
- **Monte Carlo Simulation:** Client-side integration for financial simulations.
