'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { CartItem } from '@/lib/supabase'
import { getSettings, calculateOrderTotal } from '@/lib/settings'

interface CartModalProps {
  cart: CartItem[]
  onClose: () => void
  onRemove: (index: number) => void
  onUpdateQuantity: (index: number, quantity: number) => void
  total: number
}

export default function CartModal({ cart, onClose, onRemove, onUpdateQuantity, total }: CartModalProps) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(getSettings())
  const [orderBreakdown, setOrderBreakdown] = useState(calculateOrderTotal(total, settings))

  useEffect(() => {
    // Refresh settings and recalculate when cart changes
    const currentSettings = getSettings()
    setSettings(currentSettings)
    setOrderBreakdown(calculateOrderTotal(total, currentSettings))
  }, [total])

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            ...item.product,
            size: item.size,
            quantity: item.quantity,
          })),
          subtotal: total,
          tax: orderBreakdown.tax,
          shipping: orderBreakdown.shipping,
          total: orderBreakdown.total,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        if (data.outOfStock && data.redirectTo) {
          const redirect = confirm(`${data.error}\n\nWould you like to place a custom order instead?`)
          if (redirect) {
            window.location.href = data.redirectTo
          }
        } else {
          alert(data.error || 'Failed to initiate checkout')
        }
        setLoading(false)
        return
      }

      if (data.url) {
        // Prepare items for storage
        const checkoutItems = cart.map(item => {
          if (!item.product || !item.product.id) {
            console.error('❌ Cart item missing product or product.id:', item)
            return null
          }
          return {
            id: item.product.id, // CRITICAL: Needed for stock reduction
            name: item.product.name,
            description: `${item.product.name} (Size: ${item.size || 'M'})`,
            price: item.product.price,
            quantity: item.quantity || 1,
            size: item.size || 'M', // CRITICAL: Needed for stock reduction
          }
        }).filter(item => item !== null) // Remove any null items
        
        if (checkoutItems.length === 0) {
          console.error('❌ No valid items in cart after processing')
          alert('Error: Cart items are invalid. Please refresh and try again.')
          setLoading(false)
          return
        }
        
        console.log('💾 Storing checkout items in sessionStorage BEFORE redirect:', checkoutItems)
        
        // CRITICAL: Store in sessionStorage BEFORE redirect to ensure it's available
        // Store in multiple places for redundancy
        try {
          sessionStorage.setItem('checkout_items', JSON.stringify(checkoutItems))
          sessionStorage.setItem('cart_backup', JSON.stringify(cart))
          sessionStorage.setItem('cart', JSON.stringify(cart))
          
          // Verify storage immediately
          const verify = sessionStorage.getItem('checkout_items')
          if (!verify) {
            console.error('❌ CRITICAL: Failed to store items in sessionStorage!')
            alert('Error: Could not save cart data. Please check browser settings and try again.')
            setLoading(false)
            return
          }
          
          console.log('✅ Items stored and verified in sessionStorage')
          console.log('📋 SessionStorage keys:', Object.keys(sessionStorage))
          
          // Small delay to ensure storage is committed
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (e) {
          console.error('❌ CRITICAL: Error storing in sessionStorage:', e)
          alert('Error: Could not save cart data. Please check browser settings and try again.')
          setLoading(false)
          return
        }
        
        // Redirect to payment page
        console.log('🔄 Redirecting to payment page...')
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate checkout. Please try again.')
      setLoading(false)
    }
  }

  const getStockForItem = (item: CartItem) => {
    if (item.product.stock_by_size && item.product.stock_by_size[item.size] !== undefined) {
      return item.product.stock_by_size[item.size]
    }
    return item.product.stock ? Math.floor(item.product.stock / 4) : 0
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold hover:text-gold-light z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-serif text-gold-light mb-6">Your Cart</h2>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => {
                  const stock = getStockForItem(item)
                  const itemTotal = item.product.price * item.quantity
                  return (
                    <div
                      key={index}
                      className="p-4 bg-gray-800 rounded-lg space-y-3"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-contain"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-gold font-semibold">{item.product.name}</h3>
                            <p className="text-gray-300 text-sm">Size: {item.size}</p>
                            <p className="text-gray-400 text-sm">${item.product.price} each</p>
                          </div>
                          <button
                            onClick={() => onRemove(index)}
                            className="text-red-400 hover:text-red-300 text-xl font-bold ml-4"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gold text-sm">Quantity:</span>
                          <button
                            onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded bg-gray-700 text-gold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1
                              onUpdateQuantity(index, Math.max(1, Math.min(val, stock)))
                            }}
                            className="w-16 px-2 py-1 rounded bg-gray-700 text-gold text-center border border-gold/30"
                          />
                          <button
                            onClick={() => onUpdateQuantity(index, Math.min(stock, item.quantity + 1))}
                            disabled={item.quantity >= stock}
                            className="p-1 rounded bg-gray-700 text-gold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                          </button>
                          <span className="text-gray-400 text-xs">({stock} available)</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-semibold">${itemTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gold/20 pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax ({settings.taxPercentage}%):</span>
                    <span>${orderBreakdown.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping & Handling:</span>
                    <span>${orderBreakdown.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gold/20">
                    <span className="text-xl font-semibold text-gold-light">Total:</span>
                    <span className="text-2xl font-bold text-gold">${orderBreakdown.total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gold text-black rounded-full hover:bg-gold-light transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Demo Payment - No real charges will be made
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

