# Focora — Personal Learning Focus & Resource Vault

> **Master one skill before moving to the next.**

Focora is a modern personal learning management web application designed to help users prioritize their learning focus, curate useful study materials, and organize resources around one primary goal at a time.

---

## 🚀 Features

- **Primary Focus Prioritization:** Designate strictly one learning goal as your primary focus at any time, backed by PostgreSQL database-level constraints.
- **Sequential Goal Queue:** Manage secondary skills and disciplines waiting in the queue without distraction.
- **Curated Resource Library:** Save learning links, courses, tutorials, and documentation, either associated with a specific goal or kept as unassigned exploratory resources.
- **Live Search & Filtering:** Filter resources by skill, view unassigned materials, or search instantly by title.
- **Figma Design Fidelity:** Recreated from the Figma designs with deep royal blue branding, status pills, circular target graphics, and modern SaaS typography.
- **Real Supabase Backend:** Supabase Auth, PostgreSQL schema migrations with RLS, atomic primary goal triggers, and automated foreign key management (`ON DELETE SET NULL`).
- **Resilient Offline/Preview Mode:** Built-in seamless preview mode if Supabase environment variables are not yet configured, allowing instant UI exploration.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (custom theme, shadows, and gradients matching Figma)
- **Backend / Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth
- **Routing:** React Router v6
- **Icons:** Lucide React

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js:** v18+ (LTS recommended)
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone or navigate to the directory
cd d:/Focora

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. Supabase Database Migration
Open your Supabase project's **SQL Editor** and run the SQL migration script located at:
[`supabase/migrations/20261118000000_init_focora_schema.sql`](supabase/migrations/20261118000000_init_focora_schema.sql)

### 5. Run the Application
```bash
# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Open your browser at `http://localhost:5173`.

---

## 📂 Project Architecture

```
d:/Focora/
├── supabase/
│   ├── migrations/
│   │   └── 20261118000000_init_focora_schema.sql  # SQL schema, RLS, triggers & RPCs
│   └── README.md                                  # Supabase setup guide
├── src/
│   ├── types/
│   │   └── database.types.ts                      # TypeScript entities & interfaces
│   ├── lib/
│   │   └── supabase.ts                            # Supabase client & environment detector
│   ├── context/
│   │   └── AuthContext.tsx                        # Supabase Auth provider & session persistence
│   ├── services/
│   │   ├── goalsService.ts                        # Goals CRUD, atomic primary switch & validation
│   │   └── resourcesService.ts                    # Resources CRUD, duplicate check & search
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx                         # Header navigation, search queue & profile
│   │   │   ├── Logo.tsx                           # Custom Focora double-loop logo
│   │   │   ├── Modal.tsx                          # Accessible modal dialog
│   │   │   └── DeleteConfirmModal.tsx             # Delete confirmation with safety notices
│   │   ├── overview/
│   │   │   ├── PrimaryFocusHero.tsx               # Figma hero card with radar dial
│   │   │   ├── MetricCards.tsx                    # 4 quick metric indicators
│   │   │   ├── GoalQueueList.tsx                  # Sequential study goals queue
│   │   │   ├── RecentSavedResources.tsx           # Recent materials with direct link out
│   │   │   └── DeliberateQueueBanner.tsx          # Protocol banner
│   │   ├── goals/
│   │   │   ├── AddEditGoalModal.tsx               # Add/edit goal with inline conflict validation
│   │   │   └── GoalCard.tsx                       # Goal card with primary lead lock
│   │   └── resources/
│   │       ├── AddEditResourceModal.tsx           # Add resource with live destination check
│   │       ├── ResourceCard.tsx                   # Grid card view
│   │       ├── ResourceTable.tsx                  # Figma table view with action icons
│   │       └── ResourceFilterBar.tsx              # Goal pills, search & view toggle
│   ├── pages/
│   │   ├── OverviewPage.tsx                       # Dashboard overview
│   │   ├── GoalsPage.tsx                          # Full goals curriculum management
│   │   ├── ResourcesPage.tsx                      # Full resource library with filters & search
│   │   └── AuthPage.tsx                           # Figma split-view login/signup
│   ├── App.tsx                                    # Routes & protected layout
│   ├── main.tsx
│   └── index.css                                  # Tailwind directives & styles
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🔒 Security & Edge Cases Handled

1. **Strict Single Primary Focus:** At most one goal can have `is_primary = true` per user, enforced both client-side and via database partial unique index.
2. **Resource Preservation on Goal Deletion:** Deleting a goal never deletes resources; `ON DELETE SET NULL` automatically unassigns them.
3. **Primary Selection Reset:** Deleting the primary goal safely resets the selection to `null` without automatically picking a replacement.
4. **Duplicate Skill Conflict:** Case-insensitive, trimmed check prevents duplicate goal names for the same user.
5. **URL Validation & Duplicate Warning:** Detects valid `http/https` protocols and provides real-time warning if a URL has already been saved.
6. **Double Submission Prevention:** Save buttons disable and display loading spinners during in-flight mutations.
7. **User Data Isolation:** Row Level Security (RLS) ensures users can only read and mutate their own records.
