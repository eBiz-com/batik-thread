# Quick Start Guide

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Admin Access

- **URL**: http://localhost:3000/admin
- **Username**: `admin`
- **Password**: `batik2025`

## Features

✅ Modern, responsive e-commerce website  
✅ Product catalog with filtering (gender, color, price)  
✅ Shopping cart with secure payment checkout (Stripe)  
✅ Admin dashboard for product management  
✅ Supabase integration for cloud storage  
✅ Beautiful UI with gold accents and African-inspired design  
✅ Payment success page  

## Business Information

- **Name**: Batik & Thread
- **Location**: Kissimmee, FL
- **WhatsApp**: +1 (321) 961-6566

## Payment System

The website uses a **demo payment API** that simulates payment processing. You can test the complete checkout flow without any setup:

- Click "Proceed to Payment" in the cart
- Enter any card details (demo mode accepts any valid format)
- Payment will be simulated successfully
- No real charges are made

### Migrating to Stripe Later

When ready for production, see `STRIPE_MIGRATION.md` for step-by-step instructions to switch to Stripe.

## Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a project
   - Copy your project URL and anon key

2. **Set Up Database Tables**
   - Go to `/admin/setup` in your browser (after starting the dev server)
   - Click "Check & Setup Database"
   - Copy the SQL and run it in Supabase SQL Editor
   - Or follow manual instructions in `DATABASE_SETUP.md`

3. **Add Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials

## Next Steps

1. Set up your Supabase database (use `/admin/setup` for easy setup)
2. Add products via the admin dashboard
3. Configure Stripe for payment processing (optional)
4. Customize colors, images, and content as needed
5. Deploy to Vercel, Netlify, or your preferred hosting platform

## Support

For questions, contact via WhatsApp: +1 (321) 961-6566

