'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Printer, Mail, Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ReceiptData {
  receiptNumber: string
  receiptId: number | null
  items: Array<{
    description: string
    qty: number
    unitPrice: number
    total: number
  }>
  customerInfo: {
    name: string
    phone?: string
    address?: string
  }
  subtotal: number
  tax: number
  shipping: number
  taxPercent: number
  total: number
  date: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const receiptNumber = searchParams.get('receipt')
  const [loading, setLoading] = useState(true)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (typeof window === 'undefined') return

      // If we have a Stripe session_id, verify it and get receipt data
      if (sessionId && sessionId.startsWith('cs_')) {
        try {
          const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.receipt) {
              // Format receipt data for display
              const formattedReceipt: ReceiptData = {
                receiptNumber: data.receipt.receipt_number,
                receiptId: data.receipt.id,
                items: data.receipt.items || [],
                customerInfo: {
                  name: data.receipt.customer_name || 'Customer',
                  phone: data.receipt.customer_phone,
                  address: data.receipt.customer_address,
                },
                subtotal: data.receipt.subtotal || 0,
                tax: data.receipt.tax || 0,
                shipping: data.receipt.shipping || 0,
                total: data.receipt.grand_total || 0,
                date: data.receipt.receipt_date || new Date().toISOString().split('T')[0],
              }
              setReceiptData(formattedReceipt)
              if (data.receipt.customer_email) {
                setEmail(data.receipt.customer_email)
              }
              setLoading(false)
              
              // Clear cart and refresh products
              sessionStorage.removeItem('cart')
              window.dispatchEvent(new CustomEvent('refreshProducts'))
              return
            }
          }
        } catch (error) {
          console.error('Error verifying Stripe session:', error)
        }
      }

      // Fallback to sessionStorage (for demo payments)
      const stored = sessionStorage.getItem('receipt_data')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          setReceiptData(data)
          if (data.customerInfo?.email) {
            setEmail(data.customerInfo.email)
          }
        } catch (e) {
          console.error('Error parsing receipt data:', e)
        }
      }
      
      setLoading(false)
      
      // Clear cart and refresh products after successful purchase
      sessionStorage.removeItem('cart')
      if (window.location.pathname === '/success') {
        window.dispatchEvent(new CustomEvent('refreshProducts'))
      }
    }

    fetchReceiptData()
  }, [sessionId])

  const handlePrint = () => {
    window.print()
  }

  const handleEmailReceipt = async () => {
    if (!email || !receiptData) return

    setSendingEmail(true)
    try {
      const response = await fetch('/api/receipts/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          receiptData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setEmailSent(true)
      } else {
        alert(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-bg-accent">
        <div className="text-gold text-xl">Loading receipt...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Success Message */}
        <div className="bg-gray-900 rounded-xl p-8 mb-6 text-center print:hidden">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-gold-light mb-4">Payment Successful!</h1>
          <p className="text-gray-300 mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {receiptNumber && (
            <p className="text-sm text-gray-400">
              Receipt Number: <span className="font-mono text-gold">{receiptNumber}</span>
            </p>
          )}
        </div>

        {/* Receipt */}
        {receiptData && (
          <div className="bg-white rounded-xl shadow-2xl p-8 print:p-6 relative" id="receipt">
            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none print:block" style={{ zIndex: 0 }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45" style={{ 
                fontSize: '72px', 
                color: 'rgba(0, 0, 0, 0.08)', 
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                TEST RECEIPT
              </div>
            </div>
            <div className="relative" style={{ zIndex: 1 }}>
            {/* Receipt Header */}
            <div className="flex items-center gap-4 mb-4 pb-3 border-b-2 border-gray-300 print:mb-2 print:pb-2">
              <div className="relative w-16 h-16 print:w-12 print:h-12">
                <Image
                  src="/logo.jpg"
                  alt="Batik & Thread Logo"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-serif text-gray-900 font-bold mb-1 print:text-lg print:mb-0">Batik & Thread</h1>
                <div className="text-xs text-gray-600 print:text-xs">
                  Location: Kissimmee, FL<br />
                  Phone: <a href="tel:+13219616566" className="text-gray-900">(321) 961-6566</a>
                </div>
              </div>
            </div>

            {/* Receipt Info */}
            <div className="mb-3 flex justify-between items-center print:mb-2 print:text-xs">
              <div>
                <label className="text-xs font-semibold text-gray-700 mr-2">Receipt #:</label>
                <span className="text-gray-900 font-mono text-xs">{receiptData.receiptNumber}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mr-2">Date:</label>
                <span className="text-gray-900 text-xs">{new Date(receiptData.date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-4 print:mb-2">
              <h2 className="text-base font-bold text-gray-900 mb-2 print:text-sm print:mb-1">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0">Name</label>
                  <p className="text-gray-900 text-sm print:text-xs">{receiptData.customerInfo.name}</p>
                </div>
                {receiptData.customerInfo.phone && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0">Phone</label>
                    <p className="text-gray-900 text-sm print:text-xs">{receiptData.customerInfo.phone}</p>
                  </div>
                )}
                {receiptData.customerInfo.address && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0">Address</label>
                    <p className="text-gray-900 text-sm print:text-xs">{receiptData.customerInfo.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-4 print:mb-2">
              <h2 className="text-base font-bold text-gray-900 mb-2 print:text-sm print:mb-1">Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold text-gray-900">Description</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 w-20">Qty</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900 w-28">Unit Price</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900 w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-gray-900 text-sm">{item.description}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-gray-900 text-sm">{item.qty}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-gray-900 text-sm">${item.unitPrice.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-gray-900 text-sm font-semibold">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4 print:mb-2">
              <h2 className="text-base font-bold text-gray-900 mb-2 print:text-sm print:mb-1">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
                <div className="space-y-2 print:space-y-1">
                  <div className="flex justify-between items-center print:text-xs">
                    <label className="text-xs font-semibold text-gray-700">Subtotal:</label>
                    <span className="text-gray-900 font-semibold text-xs">${receiptData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center print:text-xs">
                    <label className="text-xs font-semibold text-gray-700">Shipping:</label>
                    <span className="text-gray-900 font-semibold text-xs">${receiptData.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center print:text-xs">
                    <label className="text-xs font-semibold text-gray-700">Tax ({receiptData.taxPercent.toFixed(1)}%):</label>
                    <span className="text-gray-900 font-semibold text-xs">${receiptData.tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gold/10 border-2 border-gold rounded-lg p-4 w-full print:p-2 print:border">
                    <div className="text-center">
                      <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0 print:text-xs">Total Amount</label>
                      <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                        ${receiptData.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="text-center text-gray-600 text-xs mb-4 italic print:mb-2 print:text-xs">
              Please keep this receipt for your records.
            </div>

            {/* Email Section */}
            <div className="mb-6 print:hidden border-t border-gray-300 pt-4">
              <h3 className="text-gold mb-3 font-semibold">Get Receipt via Email</h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold text-gray-900"
                />
                <button
                  onClick={handleEmailReceipt}
                  disabled={!email || sendingEmail || emailSent}
                  className="px-6 py-2 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {emailSent ? (
                    <>
                      <CheckCircle size={18} />
                      Sent!
                    </>
                  ) : sendingEmail ? (
                    <>
                      <Mail size={18} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Send Email
                    </>
                  )}
                </button>
              </div>
              {emailSent && (
                <p className="text-green-400 text-sm mt-2">Receipt sent to {email}!</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold"
              >
                <Printer size={20} />
                Print Receipt
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t border-gray-300 text-xs text-gray-500 italic print:mt-2 print:pt-2 print:text-xs">
              Thank you for shopping with Batik & Thread!
            </div>
            </div>
          </div>
        )}

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            .print\\:hidden {
              display: none !important;
            }
            #receipt {
              box-shadow: none;
              border: none;
              padding: 0.5cm !important;
              max-width: 100%;
              margin: 0;
            }
            table {
              font-size: 10px !important;
            }
            th, td {
              padding: 0.2rem 0.3rem !important;
            }
            h1 {
              font-size: 20px !important;
            }
            h2 {
              font-size: 14px !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-bg-accent">
        <div className="text-gold text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
