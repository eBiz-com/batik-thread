import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbetxpvmtmnkbqtosjso.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Product {
  id: number
  name: string
  price: number
  gender: string
  color: string
  fabric: string
  origin: string
  story: string
  images: string[]
  stock?: number // Legacy: total stock (if stock_by_size not available)
  stock_by_size?: { [size: string]: number } // New: stock by size, e.g., {S: 5, M: 10, L: 8, XL: 2}
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface CustomRequest {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  event_name: string
  event_date: string
  quantity: number
  sizes: string // JSON string or comma-separated
  description: string
  style_images: string[] // Array of image URLs
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'completed'
  admin_notes?: string
  created_at: string
  updated_at?: string
}

export interface ReceiptItem {
  description: string
  qty: number
  unitPrice: number
  total: number
}

export interface Receipt {
  id: number
  receipt_number: string
  receipt_date: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: ReceiptItem[] // JSON array
  subtotal: number
  shipping: number
  tax_percent: number
  tax_amount: number
  grand_total: number
  created_at: string
  created_by?: string
}

export interface Transaction {
  id: number
  receipt_number: string
  receipt_id?: number // Link to receipts table
  transaction_date: string
  customer_name: string
  customer_phone?: string
  customer_address?: string
  items: ReceiptItem[] // JSON array of products
  product_total: number // Sum of all product costs
  shipping_cost: number
  tax_percent: number
  tax_amount: number
  total_amount: number
  payment_status: 'completed' | 'refunded' | 'transaction_closed'
  refund_amount?: number
  refund_date?: string
  refund_reason?: string
  created_at: string
  updated_at?: string
  transaction_source: 'checkout' | 'admin_receipt' // Where the transaction came from
}

export interface ContactCardSettings {
  id: number
  company_name: string
  company_theme: string
  company_tagline: string
  company_logo_url?: string
  location_city: string
  location_state: string
  phone_number: string
  whatsapp_number: string
  show_website: boolean
  website_url?: string
  website_name?: string
  show_event: boolean
  event_name?: string
  event_address?: string
  event_website_url?: string
  event_website_name?: string
  show_stand_number: boolean
  stand_number?: string
  qr_code_url?: string
  card_id: string
  created_at: string
  updated_at?: string
}
