'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Printer, Eye, Calendar, DollarSign, FileText, X } from 'lucide-react'
import Link from 'next/link'
import { Receipt } from '@/lib/supabase'

export default function ReceiptsHistoryPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [receipts, searchTerm, startDate, endDate, minAmount, maxAmount])

  const fetchReceipts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('receipt_number', searchTerm)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (minAmount) params.append('min_amount', minAmount)
      if (maxAmount) params.append('max_amount', maxAmount)

      const response = await fetch(`/api/receipts?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setReceipts(result.data || [])
      } else {
        console.error('Error fetching receipts:', result.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...receipts]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.receipt_number.toLowerCase().includes(term) ||
          r.customer_name.toLowerCase().includes(term) ||
          r.customer_phone.includes(term)
      )
    }

    // Date filters
    if (startDate) {
      filtered = filtered.filter((r) => r.receipt_date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((r) => r.receipt_date <= endDate)
    }

    // Amount filters
    if (minAmount) {
      filtered = filtered.filter((r) => r.grand_total >= parseFloat(minAmount))
    }
    if (maxAmount) {
      filtered = filtered.filter((r) => r.grand_total <= parseFloat(maxAmount))
    }

    setFilteredReceipts(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
    setShowFilters(false)
  }

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
  }

  const handlePrintReceipt = (receipt: Receipt) => {
    // Open receipt in new window for printing
    const receiptWindow = window.open('', '_blank')
    if (receiptWindow) {
      const items = typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items
      
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt ${receipt.receipt_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; position: relative; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 72px; color: rgba(0, 0, 0, 0.08); font-weight: bold; z-index: 0; pointer-events: none; white-space: nowrap; }
            .header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 20px; position: relative; z-index: 1; }
            .logo { width: 60px; height: 60px; }
            .company { flex: 1; text-align: center; }
            .company h1 { margin: 0; font-size: 24px; }
            .info { margin: 20px 0; position: relative; z-index: 1; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; position: relative; z-index: 1; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background: #f0f0f0; }
            .summary { margin-top: 20px; position: relative; z-index: 1; }
            .total { font-size: 24px; font-weight: bold; text-align: center; padding: 20px; background: #f9f9f9; border: 2px solid #000; }
          </style>
        </head>
        <body>
          <div class="watermark" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 72px; color: rgba(0, 0, 0, 0.08); font-weight: bold; z-index: 0; pointer-events: none; white-space: nowrap;">TEST RECEIPT</div>
          <div class="header" style="position: relative; z-index: 1;">
            <div class="company">
              <h1>Batik & Thread</h1>
              <p>Location: Kissimmee, FL<br>Phone: (321) 961-6566</p>
            </div>
          </div>
          <div class="info">
            <p><strong>Receipt #:</strong> ${receipt.receipt_number}</p>
            <p><strong>Date:</strong> ${new Date(receipt.receipt_date).toLocaleDateString()}</p>
          </div>
          <div class="info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${receipt.customer_name}</p>
            <p><strong>Phone:</strong> ${receipt.customer_phone}</p>
            <p><strong>Address:</strong> ${receipt.customer_address}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.qty}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <p><strong>Subtotal:</strong> $${receipt.subtotal.toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${receipt.shipping.toFixed(2)}</p>
            <p><strong>Tax (${receipt.tax_percent}%):</strong> $${receipt.tax_amount.toFixed(2)}</p>
            <div class="total">Total: $${receipt.grand_total.toFixed(2)}</div>
          </div>
          <p style="text-align: center; margin-top: 20px; font-style: italic;">Thank you for shopping with Batik & Thread!</p>
          <script>window.onload = () => window.print();</script>
        </body>
        </html>
      `)
      receiptWindow.document.close()
    }
  }

  const totalRevenue = filteredReceipts.reduce((sum: number, r) => sum + r.grand_total, 0)
  const totalReceipts = filteredReceipts.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-serif text-gold-light">Receipt History</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all font-semibold"
            >
              Back to Admin
            </Link>
            <Link
              href="/admin/receipt"
              className="px-4 py-2 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold"
            >
              New Receipt
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Receipts</h3>
            <p className="text-2xl font-bold">{totalReceipts}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Average Receipt</h3>
            <p className="text-2xl font-bold text-blue-400">
              ${totalReceipts > 0 ? (totalRevenue / totalReceipts).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 p-6 rounded-xl mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by receipt number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all"
            >
              <Filter size={18} />
              Filters
            </button>
            {(startDate || endDate || minAmount || maxAmount) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
              >
                <X size={18} />
                Clear
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gold/20">
              <div>
                <label className="block text-gold text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-gold text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-gold text-sm mb-2">Min Amount</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-gold text-sm mb-2">Max Amount</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Receipts Table */}
        <div className="bg-gray-900 p-6 rounded-xl overflow-x-auto">
          {isLoading ? (
            <p className="text-gray-400 text-center py-8">Loading receipts...</p>
          ) : filteredReceipts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No receipts found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left p-4 text-gold">Receipt #</th>
                  <th className="text-left p-4 text-gold">Date</th>
                  <th className="text-left p-4 text-gold">Customer</th>
                  <th className="text-left p-4 text-gold">Phone</th>
                  <th className="text-left p-4 text-gold">Shipping Address</th>
                  <th className="text-right p-4 text-gold">Items</th>
                  <th className="text-right p-4 text-gold">Total</th>
                  <th className="text-center p-4 text-gold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => {
                  const items = typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items
                  return (
                    <tr key={receipt.id} className="border-b border-gold/10 hover:bg-gray-800">
                      <td className="p-4 font-mono">{receipt.receipt_number}</td>
                      <td className="p-4">{new Date(receipt.receipt_date).toLocaleDateString()}</td>
                      <td className="p-4">{receipt.customer_name}</td>
                      <td className="p-4">{receipt.customer_phone || 'N/A'}</td>
                      <td className="p-4 text-xs text-gray-400 max-w-xs truncate">{receipt.customer_address || 'N/A'}</td>
                      <td className="p-4 text-right">{items.length}</td>
                      <td className="p-4 text-right font-semibold text-gold">${receipt.grand_total.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewReceipt(receipt)}
                            className="text-blue-400 hover:text-blue-300 p-2"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(receipt)}
                            className="text-gold hover:text-gold-light p-2"
                            title="Print"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gold-light">Receipt Details</h2>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gold hover:text-gold-light text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-gold mb-2">Receipt Information</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Receipt #:</strong> {selectedReceipt.receipt_number}</p>
                  <p><strong>Date:</strong> {new Date(selectedReceipt.receipt_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-gold mb-2">Customer Information</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedReceipt.customer_name}</p>
                  <p><strong>Phone:</strong> {selectedReceipt.customer_phone}</p>
                  <p><strong>Address:</strong> {selectedReceipt.customer_address}</p>
                </div>
              </div>

              <div>
                <h3 className="text-gold mb-2">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gold/20 px-3 py-2 text-left text-sm text-gold">Description</th>
                        <th className="border border-gold/20 px-3 py-2 text-center text-sm text-gold">Qty</th>
                        <th className="border border-gold/20 px-3 py-2 text-right text-sm text-gold">Unit Price</th>
                        <th className="border border-gold/20 px-3 py-2 text-right text-sm text-gold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(typeof selectedReceipt.items === 'string' ? JSON.parse(selectedReceipt.items) : selectedReceipt.items).map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-gold/20 px-3 py-2">{item.description}</td>
                          <td className="border border-gold/20 px-3 py-2 text-center">{item.qty}</td>
                          <td className="border border-gold/20 px-3 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="border border-gold/20 px-3 py-2 text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-gold mb-2">Summary</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${selectedReceipt.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({selectedReceipt.tax_percent}%):</span>
                    <span>${selectedReceipt.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gold font-bold text-lg pt-2 border-t border-gold/20">
                    <span>Grand Total:</span>
                    <span>${selectedReceipt.grand_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold"
              >
                <Printer size={20} />
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

