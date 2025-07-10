# Fitness Center & Gym App 🏋️‍♂️

A **full-stack gym and fitness center app** built with **Next.js 15**, **Supabase**, **Clerk**, and **Stripe**. Manage memberships, subscriptions, and user profiles with a modern, scalable stack and beautiful UI.

## 🔍 Description

This project is a feature-rich gym management platform, supporting:
- **Authentication** (Clerk)
- **Subscription management** (Stripe + Supabase)
- **Admin dashboard** for user and subscription control
- **Profile management**
- **Responsive UI** with Tailwind CSS and ShadCN

## 📁 Project Structure

```
.
├── app/           # Next.js app directory (pages, layouts, API routes)
├── lib/           # Client utilities (Supabase, etc.)
├── public/        # Static assets
└── ...            # Config, styles, etc.
```

## 🚀 Features

- **Clerk authentication** (sign up, sign in, user roles)
- **Stripe-powered subscriptions** (monthly, quarterly, yearly, etc.)
- **Admin dashboard** (manage users, subscriptions, analytics)
- **Profile management** (update name, avatar, etc.)
- **Subscription history** and status
- **Responsive UI** (Tailwind CSS + ShadCN UI)
- **State management** with Zustand
- **Analytics & CSV export** for admins

## 🛠️ Tech Stack

- **Next.js 15** (App Router, Server Actions)
- **React 19**
- **Supabase** (database, storage)
- **Clerk** (authentication)
- **Stripe** (payments & subscriptions)
- **Tailwind CSS**
- **ShadCN UI**

## ⚙️ Installation

### 1. Clone the Repo

```bash
git clone https://github.com/andrew-dev-p/supabase-gym-app
cd supabase-gym-app
```

### 2. Install Dependencies

```bash
npm install
```

## 🧪 Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```