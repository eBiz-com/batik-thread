'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, DollarSign, TrendingUp, TrendingDown, RefreshCw, X, CheckCircle, Ban, Clock } from 'lucide-react'
import Link from 'next/link'
import { Transaction } from '@/lib/supabase'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTransactions()
    // Auto-update status for transactions older than 30 days
    updateOldTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchTerm, statusFilter, startDate, endDate])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/transactions')
      const result = await response.json()

      if (result.success) {
        setTransactions(result.data || [])
      } else {
        console.error('Error fetching transactions:', result.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOldTransactions = async () => {
    try {
      await fetch('/api/transactions/update-status', { method: 'POST' })
      // Refresh transactions after update
      setTimeout(() => fetchTransactions(), 1000)
    } catch (error) {
      console.error('Error updating transaction status:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.receipt_number.toLowerCase().includes(term) ||
          t.customer_name.toLowerCase().includes(term) ||
          t.customer_phone?.includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.payment_status === statusFilter)
    }

    // Date filters
    if (startDate) {
      filtered = filtered.filter((t) => t.transaction_date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.transaction_date <= endDate)
    }

    setFilteredTransactions(filtered)
  }

  const handleRefund = async () => {
    if (!selectedTransaction) return

    const refund = refundAmount ? parseFloat(refundAmount) : selectedTransaction.total_amount

    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_status: 'refunded',
          refund_amount: refund,
          refund_reason: refundReason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Transaction marked as refunded successfully!')
        setSelectedTransaction(null)
        setRefundAmount('')
        setRefundReason('')
        fetchTransactions()
      } else {
        alert(result.error || 'Failed to process refund')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Failed to process refund. Please try again.')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setStartDate('')
    setEndDate('')
    setShowFilters(false)
  }

  // Calculate statistics
  const totalRevenue = filteredTransactions
    .filter(t => t.payment_status === 'completed' || t.payment_status === 'transaction_closed')
    .reduce((sum: number, t) => sum + t.total_amount, 0)

  const totalRefunds = filteredTransactions
    .filter(t => t.payment_status === 'refunded')
    .reduce((sum: number, t) => sum + (t.refund_amount || t.total_amount), 0)

  const netIncome = totalRevenue - totalRefunds

  const completedCount = filteredTransactions.filter(t => t.payment_status === 'completed').length
  const refundedCount = filteredTransactions.filter(t => t.payment_status === 'refunded').length
  const closedCount = filteredTransactions.filter(t => t.payment_status === 'transaction_closed').length

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-900/50 text-green-300',
      refunded: 'bg-red-900/50 text-red-300',
      transaction_closed: 'bg-blue-900/50 text-blue-300',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-700 text-gray-300'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />
      case 'refunded':
        return <Ban size={16} />
      case 'transaction_closed':
        return <Clock size={16} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-serif text-gold-light">Sales & Transactions</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={updateOldTransactions}
              className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all text-sm"
            >
              <RefreshCw size={18} />
              Update Status
            </button>
            <Link
              href="/admin"
              className="px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all font-semibold"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Refunds</h3>
            <p className="text-2xl font-bold text-red-400">${totalRefunds.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Net Income</h3>
            <p className="text-2xl font-bold text-gold">${netIncome.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Transactions</h3>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-xl text-center">
            <h3 className="text-gold mb-1 text-sm">Completed</h3>
            <p className="text-xl font-bold text-green-400">{completedCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl text-center">
            <h3 className="text-gold mb-1 text-sm">Refunded</h3>
            <p className="text-xl font-bold text-red-400">{refundedCount}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl text-center">
            <h3 className="text-gold mb-1 text-sm">Closed</h3>
            <p className="text-xl font-bold text-blue-400">{closedCount}</p>
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="transaction_closed">Transaction Closed</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all"
            >
              <Filter size={18} />
              Filters
            </button>
            {(startDate || endDate) && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gold/20">
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
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-900 p-6 rounded-xl overflow-x-auto">
          {isLoading ? (
            <p className="text-gray-400 text-center py-8">Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left p-4 text-gold">Receipt #</th>
                  <th className="text-left p-4 text-gold">Date</th>
                  <th className="text-left p-4 text-gold">Customer</th>
                  <th className="text-right p-4 text-gold">Products</th>
                  <th className="text-right p-4 text-gold">Shipping</th>
                  <th className="text-right p-4 text-gold">Tax</th>
                  <th className="text-right p-4 text-gold">Total</th>
                  <th className="text-center p-4 text-gold">Status</th>
                  <th className="text-center p-4 text-gold">Source</th>
                  <th className="text-center p-4 text-gold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const items = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items
                  return (
                    <tr key={transaction.id} className="border-b border-gold/10 hover:bg-gray-800">
                      <td className="p-4 font-mono">{transaction.receipt_number}</td>
                      <td className="p-4">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                      <td className="p-4">{transaction.customer_name}</td>
                      <td className="p-4 text-right">${transaction.product_total.toFixed(2)}</td>
                      <td className="p-4 text-right">${transaction.shipping_cost.toFixed(2)}</td>
                      <td className="p-4 text-right">${transaction.tax_amount.toFixed(2)}</td>
                      <td className="p-4 text-right font-semibold text-gold">${transaction.total_amount.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 justify-center ${getStatusBadge(transaction.payment_status)}`}>
                          {getStatusIcon(transaction.payment_status)}
                          {transaction.payment_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center text-xs text-gray-400">
                        {transaction.transaction_source === 'checkout' ? 'Checkout' : 'Admin'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-blue-400 hover:text-blue-300 p-2"
                            title="View Details"
                          >
                            <Search size={18} />
                          </button>
                          {transaction.payment_status === 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setRefundAmount(transaction.total_amount.toString())
                              }}
                              className="text-red-400 hover:text-red-300 p-2"
                              title="Refund"
                            >
                              <Ban size={18} />
                            </button>
                          )}
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

      {/* Transaction Detail & Refund Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gold-light">Transaction Details</h2>
              <button
                onClick={() => {
                  setSelectedTransaction(null)
                  setRefundAmount('')
                  setRefundReason('')
                }}
                className="text-gold hover:text-gold-light text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-gold mb-2">Transaction Information</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Receipt #:</strong> {selectedTransaction.receipt_number}</p>
                  <p><strong>Date:</strong> {new Date(selectedTransaction.transaction_date).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadge(selectedTransaction.payment_status)}`}>
                      {selectedTransaction.payment_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Source:</strong> {selectedTransaction.transaction_source === 'checkout' ? 'Online Checkout' : 'Admin Receipt'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-gold mb-2">Customer Information</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedTransaction.customer_name}</p>
                  {selectedTransaction.customer_phone && <p><strong>Phone:</strong> {selectedTransaction.customer_phone}</p>}
                  {selectedTransaction.customer_address && <p><strong>Address:</strong> {selectedTransaction.customer_address}</p>}
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
                      {(typeof selectedTransaction.items === 'string' ? JSON.parse(selectedTransaction.items) : selectedTransaction.items).map((item: any, index: number) => (
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
                <h3 className="text-gold mb-2">Financial Breakdown</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product Total:</span>
                    <span>${selectedTransaction.product_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Cost:</span>
                    <span>${selectedTransaction.shipping_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({selectedTransaction.tax_percent}%):</span>
                    <span>${selectedTransaction.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gold font-bold text-lg pt-2 border-t border-gold/20">
                    <span>Total Amount:</span>
                    <span>${selectedTransaction.total_amount.toFixed(2)}</span>
                  </div>
                  {selectedTransaction.payment_status === 'refunded' && selectedTransaction.refund_amount && (
                    <div className="flex justify-between text-red-400 font-semibold pt-2 border-t border-red-500/20">
                      <span>Refund Amount:</span>
                      <span>-${selectedTransaction.refund_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTransaction.payment_status === 'refunded' && selectedTransaction.refund_reason && (
                <div>
                  <h3 className="text-gold mb-2">Refund Information</h3>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Refund Date:</strong> {selectedTransaction.refund_date ? new Date(selectedTransaction.refund_date).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Refund Reason:</strong> {selectedTransaction.refund_reason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Refund Form */}
            {selectedTransaction.payment_status === 'completed' && (
              <div className="border-t border-gold/20 pt-4">
                <h3 className="text-gold mb-4">Process Refund</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gold text-sm mb-2">Refund Amount</label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={selectedTransaction.total_amount.toString()}
                      step="0.01"
                      min="0"
                      max={selectedTransaction.total_amount}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Leave empty or enter amount to refund (max: ${selectedTransaction.total_amount.toFixed(2)})
                    </p>
                  </div>
                  <div>
                    <label className="block text-gold text-sm mb-2">Refund Reason</label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={3}
                      placeholder="Enter reason for refund..."
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <button
                    onClick={handleRefund}
                    className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setSelectedTransaction(null)
                  setRefundAmount('')
                  setRefundReason('')
                }}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
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

