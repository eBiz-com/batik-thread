# Batik & Thread E-Commerce Website

A modern, elegant e-commerce website for Batik & Thread, featuring contemporary African fashion with a luxury aesthetic.

## Features

- 🛍️ **Product Catalog**: Browse beautiful African fashion pieces with filtering options
- 🛒 **Shopping Cart**: Add items to cart and checkout securely
- 💳 **Payment Integration**: Stripe Checkout for secure payments (demo/test mode)
- 📝 **Custom Order Requests**: Customers can submit bulk order requests for events
- 🎨 **Modern UI**: Beautiful, responsive design with gold accents
- 🔐 **Admin Dashboard**: Manage products and custom requests with protected admin access
- ☁️ **Supabase Integration**: Cloud-based product and request management

## Business Information

- **Business Name**: Batik & Thread
- **Location**: Kissimmee, FL
- **WhatsApp**: +1 (321) 961-6566

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Payment**: Stripe Checkout (Test Mode)
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update Supabase credentials if needed (defaults are already configured)
   - Add your Stripe test API keys (get them from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys))
     - For demo purposes, you can use the placeholder keys, but real payments require actual Stripe keys

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Dashboard

Access the admin dashboard at `/admin`:

- **Username**: `admin`
- **Password**: `batik2025`

The admin dashboard allows you to:
- Add new products
- View all products
- Delete products
- Monitor inventory

## Supabase Setup

The website uses Supabase for product and custom request storage. To set up your own Supabase instance:

### Quick Setup (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Start your development server: `npm run dev`
3. Go to `/admin/setup` in your browser
4. Click "Check & Setup Database"
5. Copy the provided SQL and run it in Supabase SQL Editor

### Manual Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Follow the instructions in `DATABASE_SETUP.md`
3. Run the SQL commands in Supabase SQL Editor

The setup page will check if your tables exist and provide ready-to-copy SQL commands with step-by-step instructions.

## Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   │   ├── checkout/       # Payment checkout
│   │   ├── custom-request/ # Custom request submission
│   │   └── payment/        # Payment processing
│   ├── custom-request/     # Custom order request page
│   ├── payment/            # Payment page
│   ├── success/            # Payment success page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── About.tsx
│   ├── CartModal.tsx
│   ├── Contact.tsx
│   ├── Filters.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ProductGrid.tsx
│   └── ProductModal.tsx
├── lib/
│   └── supabase.ts         # Supabase client configuration
└── public/                  # Static assets
```

## Building for Production

```bash
npm run build
npm start
```

## Features in Detail

### Product Filtering
- Filter by gender (Men, Women, Kids)
- Filter by color
- Filter by maximum price

### Shopping Cart
- Add products to cart
- Remove items from cart
- View cart total
- Secure checkout via Stripe (demo/test mode)
- Success page after payment

### Custom Order Requests
- Submit bulk order requests for events
- Specify event details, quantity, and sizes
- Upload style reference images (up to 5)
- Admin dashboard to review and manage requests
- Status tracking (pending, reviewed, approved, rejected, completed)

### Responsive Design
- Mobile-friendly navigation
- Responsive product grid
- Touch-friendly interactions

## Payment Setup

This website currently uses a **demo payment API** that simulates payment processing. No real charges are made, and you can test the full payment flow without any setup.

### Current Demo Payment Features:
- Simulated payment processing
- Demo payment form with card input
- Success/failure handling
- No external dependencies required

### Migrating to Stripe (When Ready)

When you're ready to accept real payments, you can easily migrate to Stripe. See `STRIPE_MIGRATION.md` for detailed instructions.

**Quick Steps:**
1. Install Stripe: `npm install stripe`
2. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Replace the demo API files with Stripe integration (see migration guide)

## Support

For questions or support, contact:
- **Phone**: +1 (321) 961-6566
- **Location**: Kissimmee, FL

## Deployment

### Deploy to Vercel from GitHub

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables (see `GITHUB_SETUP.md`)
   - Deploy!

3. **Get Your URLs:**
   - Public Site: `https://your-project.vercel.app`
   - Admin: `https://your-project.vercel.app/admin`

📖 **Full deployment guide:** See `GITHUB_SETUP.md` for detailed instructions.

## License

© 2025 Batik & Thread — Modern African Luxury

