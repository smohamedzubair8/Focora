# Focora Database Setup Guide (Supabase PostgreSQL)

This directory contains the database migration and architecture for **Focora** — Personal Learning Focus & Resource Vault.

---

## 1. Quick Setup in Supabase

1. **Create or Open a Supabase Project:**
   - Go to [database.new](https://database.new) or log in to your existing dashboard at [supabase.com](https://supabase.com).

2. **Run the Database Migration:**
   - In your Supabase dashboard, click **SQL Editor** in the left sidebar.
   - Click **+ New Query**.
   - Copy and paste the entire contents of [`supabase/migrations/20261118000000_init_focora_schema.sql`](./migrations/20261118000000_init_focora_schema.sql).
   - Click **Run** (or `Cmd/Ctrl + Enter`).

3. **Get Your API Credentials:**
   - In Supabase, go to **Project Settings** > **API**.
   - Copy your **Project URL** (`https://xyzcompany.supabase.co`).
   - Copy your **anon / public** key (`eyJhbGci...`).
   - Paste them into your `.env` file in the root of the project:
     ```env
     VITE_SUPABASE_URL=https://xyzcompany.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **Verify Authentication Settings:**
   - Under **Authentication** > **Providers**, ensure **Email** is enabled.
   - Under **Authentication** > **URL Configuration**, set the Site URL to `http://localhost:5173` (or your production domain).

---

## 2. Schema Architecture & Integrity Guarantees

### A. Strict Single Primary Focus per User
- Enforced at the PostgreSQL level via a partial unique index:
  ```sql
  CREATE UNIQUE INDEX learning_goals_one_primary_per_user 
    ON public.learning_goals (user_id) 
    WHERE is_primary = true;
  ```
- Backed by an atomic trigger `trg_ensure_single_primary_goal` and RPC function `public.set_primary_goal(p_goal_id UUID)` that atomically demotes any previous primary goal when a new primary is assigned.

### B. Case-Insensitive Duplicate Discipline Prevention
- Enforced via unique functional index:
  ```sql
  CREATE UNIQUE INDEX learning_goals_unique_skill_per_user 
    ON public.learning_goals (user_id, LOWER(TRIM(skill_name)));
  ```

### C. Safe Cascade Rules
- When a user deletes a learning goal, associated resources are **not deleted**. They are automatically unassigned (`ON DELETE SET NULL`):
  ```sql
  goal_id UUID REFERENCES public.learning_goals(id) ON DELETE SET NULL
  ```
- Deleting the primary goal naturally clears the primary selection, preserving user data and preventing automatic assumption of another goal.

### D. Cross-Tenant Integrity Trigger
- Verifies that any resource linked to `goal_id` strictly belongs to the same `user_id`:
  ```sql
  CREATE OR REPLACE TRIGGER trg_verify_resource_goal_ownership
    BEFORE INSERT OR UPDATE OF goal_id, user_id ON public.learning_resources
    FOR EACH ROW
    EXECUTE FUNCTION verify_resource_goal_ownership();
  ```

### E. Row Level Security (RLS)
- Both `learning_goals` and `learning_resources` have RLS enabled with strict policies:
  - Users can ONLY select, insert, update, or delete rows where `auth.uid() = user_id`.
