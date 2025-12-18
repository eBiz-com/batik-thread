'use client'

import { useState } from 'react'
import { Database, CheckCircle, AlertCircle, Loader2, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setResult(null)
    setCopied(false)

    try {
      // Use the new auto-setup endpoint that includes all tables
      const response = await fetch('/api/auto-setup-database', {
        method: 'GET',
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to connect to setup API',
      })
    } finally {
      setLoading(false)
    }
  }

  const copySQL = () => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sqlCommands = `-- ============================================
-- COMPLETE DATABASE SETUP FOR BATIK & THREAD
-- Copy and paste this entire script in Supabase SQL Editor
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  gender TEXT,
  color TEXT,
  fabric TEXT,
  origin TEXT,
  story TEXT,
  images TEXT[],
  stock INTEGER DEFAULT 0,
  stock_by_size JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. CUSTOM_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS custom_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  sizes TEXT NOT NULL,
  description TEXT NOT NULL,
  style_images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 3. RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL NOT NULL DEFAULT 0,
  shipping DECIMAL NOT NULL DEFAULT 0,
  tax_percent DECIMAL NOT NULL DEFAULT 0,
  tax_amount DECIMAL NOT NULL DEFAULT 0,
  grand_total DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  receipt_id BIGINT REFERENCES receipts(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  product_total DECIMAL NOT NULL DEFAULT 0,
  shipping_cost DECIMAL NOT NULL DEFAULT 0,
  tax_percent DECIMAL NOT NULL DEFAULT 0,
  tax_amount DECIMAL NOT NULL DEFAULT 0,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('completed', 'refunded', 'transaction_closed')),
  refund_amount DECIMAL,
  refund_date TIMESTAMP,
  refund_reason TEXT,
  transaction_source TEXT DEFAULT 'checkout' CHECK (transaction_source IN ('checkout', 'admin_receipt')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- ENABLE REALTIME (for automatic updates)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;`.trim()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-serif text-gold-light">Database Setup</h1>
          </div>

          <p className="text-gray-300 mb-6">
            This page helps you set up the required database tables for Batik & Thread. 
            You can either use the automated setup (if configured) or manually run the SQL commands.
          </p>

          {/* Automated Setup */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-serif text-gold mb-4">Automated Setup</h2>
            <p className="text-gray-400 text-sm mb-4">
              Click the button below to check if your database is set up using your existing Supabase credentials. 
              If tables don't exist, you'll get the SQL commands to run manually.
            </p>
            <div className="bg-blue-900/20 border border-blue-500/50 rounded p-3 mb-4 text-sm text-blue-300">
              <strong>Note:</strong> Using Supabase credentials from your configuration. 
              The service role key is optional - the anon key works fine for checking table existence.
            </div>
            <button
              onClick={handleSetup}
              disabled={loading}
              className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking Database...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Check & Setup Database
                </>
              )}
            </button>

            {result && (
              <div className={`mt-4 p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-900/30 border border-green-500' 
                  : 'bg-yellow-900/30 border border-yellow-500'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold mb-2 ${
                      result.success ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      {result.message || result.error}
                    </p>
                    
                    {result.tables && (
                      <div className="text-sm text-gray-300 mb-3">
                        <p>Tables Status:</p>
                        <ul className="list-disc list-inside ml-2">
                          {Array.isArray(result.tables) ? (
                            result.tables.map((table: string, index: number) => (
                              <li key={index}>{table}</li>
                            ))
                          ) : (
                            <>
                              <li>Products: {result.tables.products ? '✓ Exists' : '✗ Missing'}</li>
                              <li>Custom Requests: {result.tables.custom_requests ? '✓ Exists' : '✗ Missing'}</li>
                              <li>Receipts: {result.tables.receipts ? '✓ Exists' : '✗ Missing'}</li>
                              <li>Transactions: {result.tables.transactions ? '✓ Exists' : '✗ Missing'}</li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}

                    {result.note && (
                      <div className="text-xs text-gray-400 mt-2 italic">
                        {result.note}
                      </div>
                    )}

                    {result.sql && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-300">SQL Commands:</p>
                          <button
                            onClick={copySQL}
                            className="text-xs px-3 py-1 bg-gray-700 text-gold rounded hover:bg-gray-600 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? 'Copied!' : 'Copy SQL'}
                          </button>
                        </div>
                        <pre className="bg-black p-4 rounded text-xs text-gray-300 overflow-x-auto">
                          {result.sql}
                        </pre>
                      </div>
                    )}

                    {result.instructions && Array.isArray(result.instructions) && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-300 mb-2">Instructions:</p>
                        <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1">
                          {result.instructions.map((instruction: string, index: number) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {result.error && !result.sql && (
                      <p className="text-sm text-red-300 mt-2">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Setup */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-serif text-gold mb-4">Manual Setup</h2>
            <p className="text-gray-400 text-sm mb-4">
              If automated setup doesn't work, you can manually run these SQL commands in your Supabase SQL Editor.
            </p>

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-300">Copy and run these SQL commands:</p>
              <div className="flex gap-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1 bg-gold text-black rounded hover:bg-gold-light flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Supabase
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlCommands)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="text-xs px-3 py-1 bg-gray-700 text-gold rounded hover:bg-gray-600 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
            </div>

            <pre className="bg-black p-4 rounded text-xs text-gray-300 overflow-x-auto">
              {sqlCommands}
            </pre>

            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded">
              <p className="text-sm text-blue-300">
                <strong>Steps:</strong>
              </p>
              <ol className="list-decimal list-inside text-xs text-blue-200 mt-2 space-y-1">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Click on "SQL Editor" in the left sidebar</li>
                <li>Click "New Query"</li>
                <li>Paste the SQL commands above</li>
                <li>Click "Run" to execute</li>
              </ol>
            </div>
          </div>

          {/* Troubleshooting Section */}
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-serif text-gold mb-4">Troubleshooting</h2>
            <p className="text-gray-300 text-sm mb-4">
              If you're getting column errors (like "Could not find 'customer_email' column"), 
              the table structure might not match. Run this SQL to fix it:
            </p>
            <div className="bg-black p-4 rounded mb-4">
              <pre className="text-xs text-gray-300 overflow-x-auto">
{`-- Fix custom_requests table structure
DROP TABLE IF EXISTS custom_requests CASCADE;

CREATE TABLE custom_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  sizes TEXT NOT NULL,
  description TEXT NOT NULL,
  style_images TEXT[],
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);`}
              </pre>
            </div>
            <p className="text-xs text-gray-400">
              See <code className="bg-gray-800 px-2 py-1 rounded">FIX_CUSTOM_REQUESTS_TABLE.sql</code> for the complete fix script.
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all text-center"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

