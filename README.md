# TABEEBAK Admin Dashboard

The **Admin Dashboard** is the administrative frontend of the **TABEEBAK Healthcare Management Platform** — a centralized control panel for overseeing users, healthcare providers, laboratories, appointments, system health, and day-to-day platform operations.

Built as a modern **React** single-page application, this dashboard gives platform administrators the tools they need to manage TABEEBAK efficiently, securely, and at scale.

---

## Features

| Feature | Description |
|---|---|
| **Admin Authentication** | Secure sign-in with JWT-based session management and protected routes |
| **Dashboard Analytics** | At-a-glance metrics for access requests, patients, doctors, and laboratories |
| **User Management** | View, search, and manage patient accounts across the platform |
| **Doctor Management** | Onboard, review, and manage doctor profiles and availability |
| **Laboratory Management** | Oversee laboratory registrations, status, and operational details |
| **Appointment Monitoring** | Track and monitor appointments across the healthcare network |
| **Review & Feedback Monitoring** | Review user feedback and ratings for doctors and laboratories |
| **Notifications Management** | Configure and manage platform notification preferences |
| **AI Service Monitoring** | Monitor AI-powered healthcare services and system performance |
| **Responsive UI** | Fully responsive layout with mobile-friendly sidebar navigation |
| **Role-Based Access Control** | Admin-only access enforced at authentication and route level |

### Additional Capabilities

- **Access Request Workflow** — Review, approve, or reject doctor and laboratory onboarding requests
- **Static Content Management** — Manage website pages and promotional banners
- **Admin Settings** — Update profile information and notification preferences

---

## Technology Stack

| Category | Technology |
|---|---|
| **Framework** | [React](https://react.dev/) 18 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Routing** | [React Router](https://reactrouter.com/) v6 |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **State Management** | React Context API (`AuthContext`) + [TanStack React Query](https://tanstack.com/query) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| **Forms & Validation** | React Hook Form + Zod |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library |

---

## Project Structure

```
Admin/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx    # Main dashboard shell & sidebar
│   │   ├── ui/                        # Reusable shadcn/ui components
│   │   ├── DataTable.tsx
│   │   ├── NavLink.tsx
│   │   └── ProtectedRoute.tsx         # Auth guard for protected routes
│   ├── contexts/
│   │   └── AuthContext.tsx            # Authentication state & session
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts                   # Shared utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx              # Analytics overview
│   │   ├── Login.tsx                  # Admin sign-in
│   │   ├── Requests.tsx               # Access request management
│   │   ├── Patients.tsx               # Patient management
│   │   ├── Doctors.tsx                # Doctor management
│   │   ├── Laboratories.tsx           # Laboratory management
│   │   ├── Pages.tsx                  # Static pages list
│   │   ├── PageCreate.tsx / PageEdit.tsx / PageForm.tsx
│   │   ├── Banners.tsx                # Banner management
│   │   ├── BannerCreate.tsx / BannerEdit.tsx / BannerForm.tsx
│   │   ├── Settings.tsx               # Admin profile & preferences
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── services/
│   │   ├── admin/
│   │   │   ├── authService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── requestService.ts
│   │   │   ├── userService.ts
│   │   │   ├── bannersService.ts
│   │   │   ├── staticPagesService.ts
│   │   │   └── types.ts
│   │   └── api/
│   │       ├── axiosInstance.ts       # Axios client & interceptors
│   │       ├── tokenStorage.ts
│   │       └── errors.ts
│   ├── test/
│   │   ├── example.test.ts
│   │   └── setup.ts
│   ├── App.tsx                        # Root component & route definitions
│   ├── main.tsx                       # Application entry point
│   └── index.css                      # Global styles & Tailwind directives
├── components.json                    # shadcn/ui configuration
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** (or yarn / pnpm / bun)
- A running **TABEEBAK backend API** instance

---

## Installation

1. **Clone the repository** and navigate to the Admin dashboard directory:

   ```bash
   cd Admin
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables** (optional):

   Create a `.env` file in the project root:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_ADMIN_LOGIN_ENDPOINT=/api/v1/auth/signin
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at **http://localhost:8080**.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the application for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

---

## Authentication & Access Control

- Only users with the **Admin** role can access the dashboard.
- Authentication tokens are stored securely and attached to API requests via Axios interceptors.
- Protected routes redirect unauthenticated users to the login page.
- Expired or invalid sessions (401/403 responses) automatically trigger logout.

---

## Deployment

The project includes a `vercel.json` configuration for deployment on [Vercel](https://vercel.com/). For other platforms, run `npm run build` and serve the contents of the `dist/` directory.

---

## License

This project is part of the **TABEEBAK Healthcare Management Platform**. All rights reserved.
