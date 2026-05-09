# Druk Stay — Bhutan House Rental Platform

A full-stack house rental web application for Bhutan, built with Vite + React and Supabase.

## Setup Instructions

### 1. Supabase Project
1. Go to supabase.com and create a new project.
2. In the SQL Editor, paste and run the entire contents of SCHEMA.sql.
3. Go to Storage in the sidebar — the bucket `listing-images` should appear automatically.

### 2. Environment Variables
Copy .env.example to .env and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run
```bash
npm install
npm run dev
```

## Application Structure
src/
  components/business/   - ListingForm (add/edit with image upload)
  components/customer/   - ListingCard, FilterPanel
  context/AuthContext    - Supabase auth, profile management
  lib/supabase.js        - Supabase client
  lib/constants.js       - Dzongkhags, BHK, amenities
  pages/auth/            - LoginPage, RegisterPage
  pages/business/        - Dashboard, AddListing, EditListing, BusinessBookings
  pages/customer/        - CustomerHome, ListingDetail, MyBookings
  App.jsx                - Routes and protected route logic

## Key Notes
- Run SCHEMA.sql in Supabase SQL Editor before starting
- Create .env from .env.example with your Supabase credentials
- Images stored in Supabase Storage (listing-images bucket)
- RLS enabled on all tables
- Role-based routing: customers /explore, business /business
