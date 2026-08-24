# 🏡 TrustNest — PG Discovery & Accommodation Management Platform

> **TrustNest** is a full-stack, enterprise-grade Paying Guest (PG) discovery and accommodation management platform engineered for radical transparency, trust scoring, and streamlined operations for both residents and property owners.

---

## ✨ Key Features & Architecture

### 🛡️ 1. Algorithmic TrustScore™ Engine
* **Multivariate Scoring**: Calculates a dynamic score (0.0 to 5.0) combining:
  * **Verified Resident Reviews** (60% weight).
  * **Daily Food Quality Ratings** (20% weight).
  * **24-Hour SLA Violations** (-0.15 points per breached ticket).
  * **Active Safety & Audit Flags** (-0.25 points per active warning).
  * **Payment Timeliness Metrics**.
* **Audit Trail**: Every recalculation is logged in the `TrustScoreLog` model with a full JSON snapshot of contributing sub-metrics.

### ⏱️ 2. 24-Hour SLA Complaint Resolution System
* **Real-time SLA Countdown**: Every submitted complaint automatically receives an immutable 24-hour deadline.
* **Tiered Severity & Visual Status**: Dynamically transitions between `SAFE`, `DUE_SOON`, `OVERDUE`, and `RESOLVED` states with color-coded badges and countdown timers.
* **Interactive Communication Thread**: Real-time messaging between residents and owners with optimistic UI updates.
* **Automated Penalty Enforcement**: Breached tickets trigger immediate property score deductions and warning flags.

### 📐 3. Interactive Room & Bed Management
* **Architectural Floor Plans**: Visual floor-by-floor blueprint breakdown.
* **Bed-Level State Machine**: Instant status toggling (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`) synchronized with public discovery listings.
* **Room Capacity & Amenities**: Detailed breakdown of washrooms, balconies, AC, and high-speed Wi-Fi per unit.

### 🍱 4. Food & Daily Menu Transparency
* **Daily Menu Publisher**: Owners can upload meal schedules (Breakfast, Lunch, Dinner) with food photos and dietary tagging (`Veg` / `Non-Veg`).
* **Resident Micro-Feedback**: Verified tenants rate daily meals with 1–5 stars and leave reviews.
* **Public Transparency Hub**: Prospective tenants can inspect the last 7 days of actual meals before booking.

### 💳 5. Financials & Rent Management
* **Revenue Analytics**: Real-time tracking of Expected vs. Collected rent and overall Collection Rate.
* **Floor-wise Breakdown**: Visual matrix of bed-by-bed payment statuses.
* **Manual & Digital Payments**: Record offline cash/bank transfers or online payments with auto-generated transaction IDs.
* **Exportable Audit Logs**: One-click `.csv` export of complete payment history.

### 🔔 6. Live Notification Center
* **Instant Alerts**: Automated notifications for rent payments, complaint tickets, owner replies, and system announcements.
* **Contextual Categories**: Category-specific badges (Payment, Complaint, Food, System).
* **Cross-Portal Support**: Available in both Admin/Owner and Resident portal headers with auto-polling.

### 📊 7. Analytics & Reports
* **Interactive Recharts Visualizers**:
  * Monthly Revenue & Collection Trends (bar chart comparison).
  * Bed Occupancy Trajectory (area gradient chart).
  * SLA Category Distribution and average resolution turnaround times.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom design system: Slate-50 background, `#4F46E5` Deep Indigo accent, `tabular-nums` typography)
* **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (local dev) / PostgreSQL (production)
* **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials provider with RBAC for `OWNER`, `TENANT`, and `INSPECTOR` roles)
* **Charts**: [Recharts](https://recharts.org/)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
TrustNest/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Property, Floor, Room, Bed, Stays, Payments, Complaints, etc.)
│   └── seed.ts                # Realistic seed script with properties, rooms, beds, tenants, menus, complaints, payments
├── public/
│   └── uploads/               # Local file upload destination for property & meal images
├── src/
│   ├── actions/               # Next.js Server Actions
│   │   ├── bed.actions.ts         # Bed status management
│   │   ├── complaint.actions.ts   # 24-hour SLA ticket lifecycle & chat replies
│   │   ├── financials.ts          # Payment updates & TrustScore recalculations
│   │   ├── food.actions.ts        # Daily menu publishing & image uploads
│   │   ├── notifications.ts       # Notification CRUD and read state
│   │   ├── payment.actions.ts     # Rent payment processing & manual entry
│   │   ├── review.actions.ts      # Resident reviews & owner responses
│   │   ├── room.actions.ts        # Room & bed mutations
│   │   ├── settings.actions.ts    # Owner & property profile settings
│   │   └── trust.actions.ts       # Property flag audits & score revalidation
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Landing, /search, /food, /pg/[id]
│   │   ├── admin/             # Owner / Admin portal (Dashboard, Rooms, Complaints, Payments, Analytics, Settings)
│   │   ├── owner/             # Dedicated Owner routes (/financials, /analytics, /settings)
│   │   ├── tenant/            # Resident portal (Dashboard, Room details, Food rating, Complaints, Payments)
│   │   ├── api/auth/          # NextAuth authentication endpoints
│   │   ├── layout.tsx         # Root layout with session provider
│   │   └── error.tsx          # Global fallback error boundary
│   ├── components/            # Modular React Client & Server Components
│   │   ├── admin/             # Dashboard, Financials, Complaints, Rooms, Analytics, Settings clients
│   │   ├── notifications/     # NotificationBell popover component
│   │   ├── payments/          # PayRent modal & status badges
│   │   ├── property/          # Property detail view, image gallery, room selector
│   │   ├── public/            # Navbar, hero section, featured cards, search filters
│   │   └── tenant/            # Resident navigation sidebar and dashboard widgets
│   ├── lib/                   # Shared utility modules
│   │   ├── auth.ts            # NextAuth options and role-based credential verification
│   │   ├── prisma.ts          # Optimized Prisma client instance (production-ready)
│   │   ├── sla-utils.ts       # Strict 24-hour SLA calculator
│   │   ├── trust-score.ts     # Algorithmic TrustScore calculation engine
│   │   ├── upload.ts          # Local & cloud image upload handlers
│   │   └── utils.ts           # Tailwind CSS class merger (clsx + twMerge)
│   └── middleware.ts          # Edge middleware enforcing authentication and RBAC
├── .env.example               # Environment variable specification template
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Design tokens & color palette configuration
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher
- **npm** or **yarn** / **pnpm**

### 2. Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/trustnest.git
   cd trustnest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Default `.env` configuration for local development:*
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="super-secret-key-at-least-32-chars-long"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Initialize Database & Seed Sample Data**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`.

---

## 🔑 Demo Accounts

The database comes pre-seeded with sample accounts for all user roles (Password for all accounts: `password123`):

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Property Owner** | `rajesh@emeraldelite.com` | `password123` | `/admin/dashboard` or `/admin/login` |
| **Inspector / Auditor** | `admin@trustnest.com` | `password123` | `/admin/dashboard` |
| **Resident (Priya Sharma)** | `priya.sharma@gmail.com` | `password123` | `/tenant/dashboard` or `/tenant/login` |
| **Resident (Rohan Deshmukh)** | `rohan.deshmukh@gmail.com` | `password123` | `/tenant/dashboard` |

---

## 🧪 Build & Type-Checking

To perform a clean production build and check for type safety:

```bash
# Type check without emitting files
npx tsc --noEmit

# Production build
npm run build
```

---

## 🔒 Security & Role-Based Access Control

* **Edge Middleware**: Evaluates incoming requests at the edge; unauthenticated users trying to access protected dashboards are redirected to the corresponding login pages.
* **Server Action Authorization**: Every mutation re-validates the session token using `getServerSession(authOptions)` and validates that the requesting user owns the targeted resource before executing any database mutation.
* **Password Hashing**: Passwords are securely hashed with `bcryptjs` using a salt work factor of 12.

---

## 📄 License
This project is licensed under the MIT License.
