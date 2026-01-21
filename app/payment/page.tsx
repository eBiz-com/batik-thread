'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const subtotal = parseFloat(searchParams.get('subtotal') || searchParams.get('total') || '0')
  const tax = parseFloat(searchParams.get('tax') || '0')
  const shipping = parseFloat(searchParams.get('shipping') || '0')
  const total = parseFloat(searchParams.get('total') || (subtotal + tax + shipping).toString())
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  })
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showShipping, setShowShipping] = useState(true)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '')
    
    // Limit to 4 digits (MMYY)
    const digits = v.substring(0, 4)
    
    if (digits.length === 0) return ''
    
    // Validate month (first 2 digits must be 01-12)
    if (digits.length >= 2) {
      const month = parseInt(digits.substring(0, 2))
      if (month > 12) {
        // If user types something > 12, cap it at 12
        return '12/' + digits.substring(2, 4)
      }
      if (month === 0) {
        // If user types 0, allow them to continue typing
        return digits.substring(0, 1) + (digits.length > 1 ? '/' + digits.substring(1, 4) : '')
      }
    }
    
    // Format as MM/YY
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4)
    }
    return digits
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatExpiry(input)
    setExpiry(formatted)
    
    // Clear error when user starts typing valid input
    if (formatted.length > 0 && error.includes('expiry')) {
      setError('')
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate shipping information
    if (!shippingInfo.fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!shippingInfo.phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    if (!shippingInfo.streetAddress.trim()) {
      setError('Please enter your street address')
      return
    }
    if (!shippingInfo.city.trim()) {
      setError('Please enter your city')
      return
    }
    if (!shippingInfo.state.trim()) {
      setError('Please enter your state')
      return
    }
    if (!shippingInfo.zipCode.trim()) {
      setError('Please enter your ZIP code')
      return
    }
    
    // Basic validation
    if (cardNumber.replace(/\s/g, '').length < 13) {
      setError('Please enter a valid card number')
      return
    }
    if (!cardName.trim()) {
      setError('Please enter cardholder name')
      return
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY)')
      return
    }
    
    // Validate expiry date format and values
    const expiryParts = expiry.split('/')
    if (expiryParts.length !== 2) {
      setError('Please enter expiry date in MM/YY format')
      return
    }
    
    const month = parseInt(expiryParts[0])
    const year = parseInt(expiryParts[1])
    
    if (isNaN(month) || month < 1 || month > 12) {
      setError('Month must be between 01 and 12')
      return
    }
    
    if (isNaN(year) || year < 0 || year > 99) {
      setError('Please enter a valid 2-digit year (00-99)')
      return
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV')
      return
    }

    setProcessing(true)

    // Simulate payment processing
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get items from sessionStorage (stored during checkout)
      const storedItems = typeof window !== 'undefined' ? sessionStorage.getItem('checkout_items') : null
      console.log('📦 Checking sessionStorage for checkout_items:', {
        hasStoredItems: !!storedItems,
        storedItemsLength: storedItems?.length || 0
      })
      
      let items: any[] = []
      if (storedItems) {
        try {
          items = JSON.parse(storedItems)
          console.log('✅ Parsed items from sessionStorage:', items)
        } catch (e) {
          console.error('❌ Error parsing items from sessionStorage:', e)
        }
      } else {
        console.warn('⚠️ No items in sessionStorage. Checking if cart exists...')
        // Try to get from cart as fallback
        const cartData = typeof window !== 'undefined' ? sessionStorage.getItem('cart') : null
        if (cartData) {
          try {
            const cart = JSON.parse(cartData)
            console.log('📦 Found cart in sessionStorage, converting to items:', cart)
            items = cart.map((item: any) => ({
              id: item.product?.id || item.id,
              name: item.product?.name || item.name,
              description: `${item.product?.name || item.name} (Size: ${item.size || 'M'})`,
              price: item.product?.price || item.price,
              quantity: item.quantity || 1,
              size: item.size || 'M',
            }))
            console.log('✅ Converted cart to items:', items)
          } catch (e) {
            console.error('❌ Error parsing cart:', e)
          }
        }
      }
      
      // Validate items for stock reduction
      let finalItems = items
      
      if (items.length === 0) {
        console.error('❌ ERROR: No items found in sessionStorage or cart!')
        console.error('SessionStorage keys:', typeof window !== 'undefined' ? Object.keys(sessionStorage) : [])
        alert('Error: No items found. Please go back to the cart and try checking out again.')
        setProcessing(false)
        return
      }
      
      // Validate all items have required fields (ID is critical for stock reduction)
      const invalidItems = items.filter((item: any) => !item.id)
      if (invalidItems.length > 0) {
        console.warn('⚠️ WARNING: Some items are missing product ID:', invalidItems)
        console.warn('These items will be skipped for stock reduction, but payment will proceed.')
        // Filter out invalid items but keep valid ones
        finalItems = items.filter((item: any) => item.id)
        
        if (finalItems.length === 0) {
          console.error('❌ ERROR: No valid items with IDs found!')
          alert('Error: Items are missing required information. Please go back and try checking out again.')
          setProcessing(false)
          return
        }
      }
      
      console.log('✅ Items validated for stock reduction:', finalItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity
      })))
      
      // Format full address
      const fullAddress = `${shippingInfo.streetAddress}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}${shippingInfo.country !== 'USA' ? `, ${shippingInfo.country}` : ''}`
      
      // Get customer info
      const customerInfo = {
        name: shippingInfo.fullName,
        phone: shippingInfo.phone,
        email: '', // Can be added later if needed
        address: fullAddress,
        streetAddress: shippingInfo.streetAddress,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
      }

      // Simulate payment success (always succeeds in demo)
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          subtotal,
          tax,
          shipping,
          total,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName,
          expiry,
          items: finalItems,
          customerInfo,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store receipt data in sessionStorage for success page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('receipt_data', JSON.stringify({
            receiptNumber: data.receiptNumber,
            receiptId: data.receiptId,
            items: data.items,
            customerInfo: data.customerInfo,
            subtotal: data.subtotal,
            tax: data.tax,
            shipping: data.shipping,
            taxPercent: data.taxPercent,
            total: data.amount,
            date: new Date().toISOString().split('T')[0],
          }))
        }
        // Redirect to success page
        router.push(`/success?session_id=${sessionId}&receipt=${data.receiptNumber}`)
      } else {
        throw new Error(data.error || 'Payment failed')
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-gold" />
            <h1 className="text-2xl font-serif text-gold-light">Checkout</h1>
          </div>
          <p className="text-gray-400 text-sm">Complete your order with shipping and payment information</p>
        </div>

        {/* Shipping Information */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowShipping(!showShipping)}
            className="w-full flex justify-between items-center text-left mb-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gold">Shipping Address</h2>
            <span className="text-gold">{showShipping ? '−' : '+'}</span>
          </button>
          
          {showShipping && (
            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
              <div>
                <label className="block text-gold text-sm mb-2">Full Name *</label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gold text-sm mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  placeholder="+1 (321) 961-6566"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-gold text-sm mb-2">Street Address *</label>
                <input
                  type="text"
                  value={shippingInfo.streetAddress}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, streetAddress: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold text-sm mb-2">City *</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    placeholder="Kissimmee"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gold text-sm mb-2">State *</label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    placeholder="FL"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold text-sm mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    placeholder="34744"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gold text-sm mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    placeholder="USA"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gold mb-4">Payment Information</h2>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300 text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-gray-300 text-sm">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between text-gray-300 text-sm">
                <span>Shipping & Handling:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gold/20">
              <span className="text-gray-300 font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-gold">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gold text-sm mb-2">Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gold text-sm mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gold text-sm mb-2">Expiry Date</label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                required
              />
            </div>
            <div>
              <label className="block text-gold text-sm mb-2">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                maxLength={3}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/50 text-blue-300 px-4 py-3 rounded-lg text-xs">
            <strong>Demo Mode:</strong> Use any card details. Payment will be simulated successfully.
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full px-6 py-3 bg-gold text-black rounded-full hover:bg-gold-light transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pay ${total.toFixed(2)}
              </>
            )}
          </button>

          <Link
            href="/"
            className="block text-center text-gray-400 hover:text-gold transition-colors text-sm"
          >
            Cancel and return to shop
          </Link>
        </form>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-bg-accent">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}

