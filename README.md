# 🏥 MedCare — Advanced Clinical Appointment System

<p align="center">
  <img src="public/logo.png" alt="MedCare Logo" width="120" style="border-radius: 12px; margin-bottom: 20px" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
</p>

MedCare is a high-fidelity, secure clinical SaaS platform designed to streamline medical appointments, manage doctor schedules, and provide patients with a seamless, premium healthcare booking experience. 

---

## ✨ Core Features

### 🔒 Strict Role-Based Security
- **Dual Isolation**: Distinct portals for Patients (`/patient/*`) and Administrators (`/admin/*`).
- **Middleware Protection**: Unauthenticated users are strictly blocked at the edge.
- **Server-Side Verification**: Admin APIs restrict access entirely based on a hardcoded, trusted administrator email verified via Clerk.

### 👥 Patient Portal
- **Dashboard**: Sleek, minimal overview showing upcoming, pending, and total appointments.
- **Dynamic Booking Flow**: Frictionless doctor selection, real-time availability checking, and slot booking.
- **Appointment Tracking**: Live status tracking (Pending, Approved, Rejected) including direct feedback/rejection notes from the administrator.

### 🛡️ Admin Controls
- **Doctor Management**: Complete CRUD operations for specialists, including automated bulk weekly slot generation.
- **Patient Registry**: A comprehensive view of all registered patients, their booking frequency, and direct one-click email contact capabilities via detailed modals.
- **Appointment Triage**: Approve or reject incoming appointments with required validation reasoning sent directly back to the patient.

---

## 🏗 System Architecture

MedCare relies on a scalable, serverless Next.js architecture heavily utilizing API routes for database abstraction, and Clerk for secure auth delegation.

```mermaid
graph TD
    %% Entities
    Client[Client Browser]
    Middleware([Next.js Middleware])
    
    %% Next.js App Router
    subgraph "Next.js App Router"
        AuthRouter[Auth Proxy Redirect]
        PatientUI[Patient UI Pages]
        AdminUI[Admin UI Pages]
    end
    
    %% Next.js API Routes
    subgraph "Server API (Backend)"
        PatientAPI[Patient API Routes]
        AdminAPI[Admin API Routes]
    end

    %% External Services
    ClerkAuth[(Clerk Authentication)]
    SupabaseDB[(Supabase PostgreSQL)]

    %% Connections
    Client -->|Page Requests| Middleware
    Middleware -->|Verifies Auth State| ClerkAuth
    Middleware -.->|Routes Authorized User| AuthRouter
    
    AuthRouter -->|Role = Admin| AdminUI
    AuthRouter -->|Role = Patient| PatientUI
    
    PatientUI -->|Fetch/Post Data| PatientAPI
    AdminUI -->|Fetch/Post/Patch/Delete| AdminAPI
    
    PatientAPI -->|Database Ops| SupabaseDB
    AdminAPI -->|Strict Server-Side Auth Check| ClerkAuth
    AdminAPI -->|Database Ops| SupabaseDB
```

---

## 🛤 User Flow (Authentication & Redirection)

To prevent session caching and infinite loops, MedCare uses a centralized proxy redirection strategy to ensure patients never see admin pages, and admins go straight to the dashboard.

```mermaid
sequenceDiagram
    participant User as User
    participant App as Next.js App
    participant Clerk as Clerk Auth
    participant DB as Supabase DB

    User->>App: Visits Landing Page
    User->>App: Clicks "Sign In"
    App->>Clerk: Initiates OAuth/OTP flow
    Clerk-->>User: Renders Auth Component
    User->>Clerk: Authenticates successfully
    Clerk->>App: Redirects to /auth-redirect
    
    rect rgb(240, 248, 255)
        Note over App: Role-Verification Logic
        App->>Clerk: Fetch detailed user session & email
        alt Email == ADMIN_EMAIL
            App->>App: Route to /admin/dashboard
        else Regular User
            App->>App: Route to /patient/dashboard
        end
    end
    
    App-->>User: Renders correct internal dashboard
```

---

## 🛠 Technology Stack

### Frontend
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Typography:** Inter (Google Fonts)

### Backend & Infrastructure
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** [Clerk](https://clerk.com/)
- **API Architecture:** Next.js Route Handlers (`app/api/*`)
- **Deployment:** Vercel

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/divyanshu108-01/patient_appontment.git
cd patient_appontment
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🎨 UI/UX Philosophy
The MedCare application implements a "Sharp Clinical" design language:
- **Palette**: Clean white spaces interspersed with robust primary blues (`brand-600`) and subtle semantic feedback colors (Emerald for approval, Amber for pending, Rose for rejection).
- **Componentry**: Lightly bordered components `border-slate-100` preventing jarring contrast, utilizing soft shadows for depth layering instead of harsh solid boundaries.
- **Typography**: Utilizing tight tracking (`tracking-tight`) on headers for a modern, dense software aesthetic, contrasted with open tracking (`tracking-wider`) on uppercase micro-labels.

---
<div align="center">
  <i>Built with precision for modern healthcare.</i>
</div>
