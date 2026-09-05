# QShieldX Frontend

The frontend interface for **QShieldX** — an Enterprise Cryptographic Discovery & Post-Quantum Readiness Platform.

Built for high-performance telemetry rendering, realtime agent tracking, and enterprise-grade cryptographic reporting.

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS v4
- **Component System:** shadcn/ui (Radix UI under the hood)
- **State Management & Data:** React Context API + Supabase Realtime
- **Icons:** Lucide React

## 🚀 Key Modules

1. **Dashboard (`/`)**: High-level executive overview of cryptographic posture, migration priorities, and post-quantum readiness.
2. **Discovery Wizard (`/targets/new`)**: 4-step enterprise onboarding workflow (Scope, Discovery Mode, AI Configuration, and Planner Validation). Supports External, Internal, and Hybrid targeting.
3. **Intelligence Console (`/intelligence`)**: Realtime streaming telemetry of LangGraph AI Agent nodes directly from Supabase WebSockets.
4. **CBOM Reports (`/cbom`)**: Native CycloneDX 1.7 Cyber Bill of Materials repository and visualization.

## 📦 Setup & Installation

Ensure you have Node.js 18+ installed.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file at the root of the `frontend/` directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Access the frontend at [http://localhost:3000](http://localhost:3000).

## 🏗 Architecture Decisions

- **Supabase Realtime (`@supabase/ssr`)**: Leveraged for bidirectional real-time feeds without the overhead of maintaining custom WebSocket infrastructure. Used extensively in the Intelligence Console.
- **Server Components (RSC) vs Client Components**: We prioritize Server Components for static rendering and SEO, while opting for `"use client"` primarily at the leaves of the component tree or where hooks/Realtime subscriptions are strictly necessary.

## 🤝 Contributing
For broad architectural contributions, please refer to the root `README.md` of the QShieldX repository.

---
*Developed for QShieldX Platform*
