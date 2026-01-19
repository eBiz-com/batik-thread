'use client'

import { useState, useEffect } from 'react'
import { Printer, Plus, Trash2, Calculator, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getSettings } from '@/lib/settings'

export default function ReceiptPage() {
  const [receiptNumber, setReceiptNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  })

  const [items, setItems] = useState([
    { id: 1, description: '', qty: 0, unitPrice: 0, total: 0 },
    { id: 2, description: '', qty: 0, unitPrice: 0, total: 0 },
    { id: 3, description: '', qty: 0, unitPrice: 0, total: 0 },
    { id: 4, description: '', qty: 0, unitPrice: 0, total: 0 },
  ])

  const [shipping, setShipping] = useState(0)
  const [taxPercent, setTaxPercent] = useState(7.5)
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)

  useEffect(() => {
    // Initialize receipt number and date on client side only
    if (typeof window !== 'undefined') {
      setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`)
      setReceiptDate(new Date().toISOString().split('T')[0])
    }
    // Load settings for tax and shipping defaults
    const settings = getSettings()
    setTaxPercent(settings.taxPercentage)
    setShipping(settings.shippingHandling)
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [items, shipping, taxPercent])

  const updateItem = (id: number, field: 'description' | 'qty' | 'unitPrice', value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'qty' || field === 'unitPrice') {
          updated.total = (updated.qty || 0) * (updated.unitPrice || 0)
        }
        return updated
      }
      return item
    }))
  }

  const addItemRow = () => {
    const newId = Math.max(...items.map(i => i.id)) + 1
    setItems([...items, { id: newId, description: '', qty: 0, unitPrice: 0, total: 0 }])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const calculateTotals = () => {
    const calculatedSubtotal = items.reduce((sum: number, item) => sum + (item.total || 0), 0)
    setSubtotal(calculatedSubtotal)

    const calculatedTax = calculatedSubtotal * (taxPercent / 100)
    setTaxAmount(calculatedTax)

    const calculatedTotal = calculatedSubtotal + calculatedTax + shipping
    setGrandTotal(calculatedTotal)
  }

  const handlePrint = async () => {
    // Save receipt to database before printing
    try {
      const receiptData = {
        receipt_number: receiptNumber,
        receipt_date: receiptDate,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0),
        subtotal,
        shipping,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        grand_total: grandTotal,
      }

      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      })

      const result = await response.json()
      if (!result.success) {
        console.error('Failed to save receipt:', result.error)
        // Still allow printing even if save fails
      } else {
        // Also save to transactions table
        const transactionData = {
          receipt_number: receiptNumber,
          receipt_id: result.data?.id || null,
          transaction_date: receiptDate,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          items: items.filter(item => item.description && item.qty > 0 && item.unitPrice > 0),
          product_total: subtotal,
          shipping_cost: shipping,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          total_amount: grandTotal,
          transaction_source: 'admin_receipt',
        }

        try {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
          })
        } catch (err) {
          console.error('Failed to save transaction:', err)
        }
      }
    } catch (error) {
      console.error('Error saving receipt:', error)
      // Still allow printing even if save fails
    }

    // Print the receipt
    window.print()
  }

  const clearReceipt = () => {
    if (confirm('Are you sure you want to clear this receipt?')) {
      setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`)
      setReceiptDate(new Date().toISOString().split('T')[0])
      setCustomerInfo({ name: '', phone: '', address: '' })
      setItems([
        { id: 1, description: '', qty: 0, unitPrice: 0, total: 0 },
        { id: 2, description: '', qty: 0, unitPrice: 0, total: 0 },
        { id: 3, description: '', qty: 0, unitPrice: 0, total: 0 },
        { id: 4, description: '', qty: 0, unitPrice: 0, total: 0 },
      ])
      const settings = getSettings()
      setShipping(settings.shippingHandling)
      setTaxPercent(settings.taxPercentage)
      calculateTotals()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent p-4 print:bg-white print:p-0">
      <div className="container mx-auto max-w-4xl print:max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-serif text-gold-light">Receipt Generator</h1>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all"
          >
            Back to Admin
          </Link>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 relative" id="receipt">
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
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-gray-900 font-mono text-xs print:border-0 print:bg-transparent print:p-0"
                placeholder="RCP-000001"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mr-2">Date:</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-gray-900 text-xs print:border-0 print:bg-transparent print:p-0"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-4 print:mb-2">
            <h2 className="text-base font-bold text-gray-900 mb-2 print:text-sm print:mb-1">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0">Name</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-gray-900 text-sm print:border-0 print:bg-transparent print:p-0 print:text-xs"
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0">Phone</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-gray-900 text-sm print:border-0 print:bg-transparent print:p-0 print:text-xs"
                  placeholder="Phone Number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0">Address</label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-gray-900 text-sm print:border-0 print:bg-transparent print:p-0 print:text-xs"
                  placeholder="Shipping Address"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4 print:mb-2">
            <div className="flex justify-between items-center mb-2 print:mb-1">
              <h2 className="text-base font-bold text-gray-900 print:text-sm">Items</h2>
              <button
                onClick={addItemRow}
                className="flex items-center gap-2 px-3 py-1.5 bg-gold text-black rounded-lg hover:bg-gold-light transition-all text-sm font-semibold print:hidden"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold text-gray-900">Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 w-20">Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900 w-28">Unit Price</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900 w-28">Total</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-900 w-16 print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-gold text-gray-900 text-sm"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          value={item.qty || ''}
                          onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-gold text-gray-900 text-sm text-center"
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border-none focus:outline-none focus:ring-1 focus:ring-gold text-gray-900 text-sm text-right"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={item.total > 0 ? item.total.toFixed(2) : ''}
                          readOnly
                          className="w-full px-2 py-1 border-none bg-gray-50 text-gray-900 text-sm text-right font-semibold"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center print:hidden">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
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
                  <input
                    type="text"
                    value={subtotal.toFixed(2)}
                    readOnly
                    className="w-28 px-2 py-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-right font-semibold text-xs print:border-0 print:bg-transparent print:p-0"
                  />
                </div>
                <div className="flex justify-between items-center print:text-xs">
                  <label className="text-xs font-semibold text-gray-700">Shipping:</label>
                  <input
                    type="number"
                    value={shipping || ''}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-gray-900 text-right text-xs print:border-0 print:bg-transparent print:p-0"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between items-center print:text-xs">
                  <label className="text-xs font-semibold text-gray-700">
                    Tax ({taxPercent}%):
                    <input
                      type="number"
                      value={taxPercent || ''}
                      onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                      className="ml-2 w-16 px-1 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gold text-gray-900 text-right text-xs print:hidden"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </label>
                  <input
                    type="text"
                    value={taxAmount.toFixed(2)}
                    readOnly
                    className="w-28 px-2 py-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-right font-semibold text-xs print:border-0 print:bg-transparent print:p-0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-gold/10 border-2 border-gold rounded-lg p-4 w-full print:p-2 print:border">
                  <div className="text-center">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 print:mb-0 print:text-xs">Total Amount</label>
                    <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                      ${grandTotal.toFixed(2)}
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

          {/* Action Buttons */}
          <div className="flex gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold"
            >
              <Printer size={20} />
              Print Receipt
            </button>
            <button
              onClick={clearReceipt}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold"
            >
              Clear
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-3 border-t border-gray-300 text-xs text-gray-500 italic print:mt-2 print:pt-2 print:text-xs">
            Thank you for shopping with Batik & Thread!
          </div>
          </div>
        </div>
      </div>

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
          .print\\:text-sm {
            font-size: 11px !important;
          }
          .print\\:text-xs {
            font-size: 9px !important;
          }
          .print\\:py-1 {
            padding-top: 0.15rem !important;
            padding-bottom: 0.15rem !important;
          }
          .print\\:mb-2 {
            margin-bottom: 0.3rem !important;
          }
          .print\\:mb-3 {
            margin-bottom: 0.5rem !important;
          }
          .print\\:gap-2 {
            gap: 0.3rem !important;
          }
          table {
            font-size: 10px !important;
          }
          th, td {
            padding: 0.2rem 0.3rem !important;
          }
          input {
            font-size: 10px !important;
            padding: 0.15rem 0.3rem !important;
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
  )
}

