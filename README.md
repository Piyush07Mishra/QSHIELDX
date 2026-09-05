<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg" alt="QShieldX Logo" width="120" height="120">
  <h1 align="center">QShieldX</h1>
  <p align="center">
    <strong>Enterprise Cryptographic Discovery & Post-Quantum Readiness Platform</strong>
  </p>
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi" alt="FastAPI"></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase" alt="Supabase"></a>
    <a href="https://python.langchain.com/docs/langgraph"><img src="https://img.shields.io/badge/LangGraph-AI%20Agents-blue" alt="LangGraph"></a>
    <a href="https://cyclonedx.org/"><img src="https://img.shields.io/badge/CycloneDX-CBOM-purple" alt="CycloneDX"></a>
  </p>
</div>

---

## 📖 Overview

**QShieldX** is an enterprise-grade platform designed to automatically discover, classify, and analyze cryptographic assets across your organization's internal codebases and external attack surfaces. As the industry approaches Q-Day (the advent of cryptographically relevant quantum computers), QShieldX provides actionable intelligence to transition legacy cryptography (e.g., RSA, ECC) to NIST-approved Post-Quantum Cryptography (PQC) standards like ML-KEM (Kyber) and ML-DSA (Dilithium).

## ✨ Enterprise Features

- 🤖 **Autonomous AI Orchestration (LangGraph):** Intelligent agent swarms that observe, plan, and execute context-aware discovery and vulnerability mapping.
- 🔍 **Hybrid Discovery Engine:**
  - *External Reconnaissance:* Automated DNS enumeration and port scanning via `subfinder` and `nmap`.
  - *Internal Code Analysis:* Deep SAST scanning using `semgrep`, `gitleaks`, and custom `cryptofinder` engines to locate hardcoded secrets and vulnerable cryptographic primitives.
- 📊 **Cyber Bill of Materials (CBOM):** Natively generates CycloneDX 1.7 compliant JSON CBOMs for compliance and supply chain security.
- ⚡ **Realtime Intelligence Console:** Powered by Supabase Realtime, watch agent telemetry and execution nodes stream directly to the dashboard.
- 📈 **Post-Quantum Risk Scoring:** Automated risk calculations based on data shelf life, business criticality, and cryptographic lifespans (Mosca's Theorem).

---

## 🏗️ Architecture Design

QShieldX is built on a decoupled, microservice-friendly architecture:

### 1. Frontend (Next.js 14 App Router)
- **Framework:** React 18 / Next.js 14
- **Styling & UI:** Tailwind CSS v4, `shadcn/ui`, Radix UI primitives.
- **State & Data:** Context API, Supabase Realtime Subscriptions (`@supabase/ssr`).
- **Data Visualization:** Recharts, Lucide Icons.

### 2. Backend (FastAPI + Python)
- **API Layer:** FastAPI with asynchronous background task processing.
- **AI Agent Orchestration:** LangChain / LangGraph for deterministic and generative workflows.
- **LLM Integration:** Google Gemini / OpenAI models for reasoning and threat intel.
- **Core Scanners:** Wrappers for `testssl.sh`, `nmap`, `subfinder`, `gitleaks`, etc.

### 3. Database (Supabase / PostgreSQL)
- **Tables:** `scan_jobs`, `assets`, `findings`, `risk_scores`, `cbom_reports`, `agent_activity`.
- **Features:** Row Level Security (RLS), Realtime WebSockets, Vector search capabilities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL (or a Supabase Project)
- Go (for running `subfinder`)

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Navigate to the SQL Editor and execute the schema from `supabase/migrations/00000000000000_initial_schema.sql`.
3. Apply the update migration: `supabase/migrations/20260901100000_update_status_enum.sql`.

### 2. Backend Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
GEMINI_API_KEY="your-gemini-key"
```

Start the FastAPI server:
```bash
uvicorn api:api --reload --port 8000
```

### 3. Frontend Installation
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Start the Next.js application:
```bash
npm run dev
```

The platform will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Security & Compliance

QShieldX aligns with major compliance and regulatory standards concerning cryptographic agility and post-quantum readiness, including:
- **NIST SP 800-208 / FIPS 203, 204, 205** (Post-Quantum Cryptography standards)
- **PCI-DSS v4.0** (Strong Cryptography mandates)
- **OMB M-23-02** (Migration to Post-Quantum Cryptography)

---

## 🤝 Contributing

We welcome contributions to enhance QShieldX! Please refer to the `CONTRIBUTING.md` guidelines (coming soon) before submitting pull requests. Ensure all code passes formatting and linting checks.

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---
<div align="center">
  <i>Built for the transition to a post-quantum world.</i>
</div>
