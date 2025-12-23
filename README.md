# MediToken - Hospital Token Management System

**MediToken** is a modern, real-time hospital queue management system designed to streamline the appointment process for patients and simplify administration for hospital staff. It replaces traditional physical queues with a digital token system, reducing wait times and improving the overall healthcare experience.

## 🚀 Features

### For Patients (Public)
-   **Easy Booking**: Book appointments with specific doctors for the current day.
-   **Live Queue Status**: View real-time token status and estimated wait times.
-   **Personal Dashboard**: Track your booked appointments and queue position.
-   **Mobile Responsive**: Accessible on all devices.

### For Administrators & Doctors
-   **Admin Dashboard**: Comprehensive overview of hospital statistics and daily activity.
-   **Doctor Management**: Add, update, and manage doctor profiles and schedules.
-   **Queue Control**: Real-time queue management (call next patient, mark as completed/skipped).
-   **Secure Access**: Role-based authentication (Admin vs. Patient).

## 🛠️ Technology Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

Here's an overview of the key directories in the project:

-   `app/`: Main application routes (Next.js App Router).
    -   `app/(public)`: Public-facing pages (Landing, Login, Register).
    -   `app/admin`: Admin dashboard and management routes (protected).
    -   `app/my-appointments`: Patient's personal appointment view.
-   `components/`: Reusable UI components (Navbar, AdminGuard, specific UI blocks).
-   `utils/supabase/`: Configuration for Supabase client and server-side clients.
-   `types/`: TypeScript type definitions for database tables and application interfaces.
-   `supabase/`: SQL scripts for database schema setup, RLS policies, and triggers.

## 🏁 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   A Supabase project

### 2. Clone the Repository
```bash
git clone https://github.com/ShuraimAslam/Hospital-Token-System.git
cd Hospital-Token-System
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Database Setup
The `supabase/` directory contains SQL scripts to set up your database.
1.  Run `supabase/schema.sql` to create tables and basic security policies.
2.  Run `supabase/fix_setup.sql` to ensure triggers and specific roles are configured correctly.
3.  (Optional) Run `supabase/seed_doctors.sql` to populate initial doctor data.

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛡️ Key Files for Developers

-   `middleware.ts`: Handles session management and route protection (Admin vs Public).
-   `utils/supabase/server.ts`: Helper to create a Supabase client in server components.
-   `app/admin/**`: Logic for hospital administration is isolated here.
