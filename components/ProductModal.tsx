'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Product, CartItem } from '@/lib/supabase'
import { getSettings, calculateOrderTotal } from '@/lib/settings'

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (item: CartItem) => void
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)

  // Available sizes
  const availableSizes = ['S', 'M', 'L', 'XL']
  
  // Calculate total stock across all sizes
  const getTotalStock = () => {
    if (product.stock_by_size) {
      return Object.values(product.stock_by_size).reduce((sum, stock) => sum + stock, 0)
    }
    return product.stock || 0
  }

  // Get stock for selected size
  const getStockForSize = (size: string) => {
    if (product.stock_by_size && product.stock_by_size[size] !== undefined) {
      return product.stock_by_size[size]
    }
    // If no size-specific stock, return total stock divided by 4 (assuming equal distribution)
    // Or return the legacy stock value
    return product.stock ? Math.floor(product.stock / 4) : 0
  }

  // Get available sizes (only show sizes with stock > 0)
  const getAvailableSizes = () => {
    if (product.stock_by_size) {
      return availableSizes.filter(size => (product.stock_by_size![size] || 0) > 0)
    }
    // If no size-specific stock, show all sizes
    return availableSizes
  }

  const currentStock = getStockForSize(selectedSize)
  const totalStock = getTotalStock()
  const availableSizesList = getAvailableSizes()

  // Reset quantity when size changes or if quantity exceeds stock
  useEffect(() => {
    if (quantity > currentStock) {
      setQuantity(Math.max(1, currentStock))
    }
  }, [selectedSize, currentStock, quantity])

  // Auto-select first available size if current selection has no stock
  useEffect(() => {
    if (availableSizesList.length > 0 && !availableSizesList.includes(selectedSize)) {
      setSelectedSize(availableSizesList[0])
    }
  }, [availableSizesList, selectedSize])

  useEffect(() => {
    // Auto-rotate images
    if (product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [product.images.length])

  const handleAddToCart = () => {
    if (quantity > currentStock) {
      alert(`Only ${currentStock} available in size ${selectedSize}`)
      return
    }
    if (quantity < 1) {
      alert('Quantity must be at least 1')
      return
    }
    onAddToCart({
      product,
      size: selectedSize,
      quantity,
    })
  }

  const handleBuyNow = async () => {
    if (quantity > currentStock) {
      alert(`Only ${currentStock} available in size ${selectedSize}`)
      return
    }
    if (quantity < 1) {
      alert('Quantity must be at least 1')
      return
    }

    try {
      // Calculate order breakdown
      const settings = getSettings()
      const itemTotal = product.price * quantity
      const breakdown = calculateOrderTotal(itemTotal, settings)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ ...product, size: selectedSize, quantity }],
          subtotal: itemTotal,
          tax: breakdown.tax,
          shipping: breakdown.shipping,
          total: breakdown.total,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to demo payment page
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate checkout. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl max-w-5xl w-full my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold hover:text-gold-light z-10 bg-gray-900/80 rounded-full p-2"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Carousel */}
          <div className="relative w-full min-h-[400px] md:min-h-[500px] rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
            {product.images.length > 0 && (
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-gold' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-2rem)] md:max-h-none">
            <h2 className="text-3xl font-serif text-gold-light">{product.name}</h2>
            <p className="text-2xl font-bold text-gold">${product.price}</p>
            <p className="text-gray-300">{product.story}</p>
            
            <div className="space-y-2">
              <p><strong className="text-gold">Fabric:</strong> <span className="text-gray-300">{product.fabric}</span></p>
              <p><strong className="text-gold">Origin:</strong> <span className="text-gray-300">{product.origin}</span></p>
              {/* Show total stock (before size selection) */}
              {totalStock > 0 && (
                <p><strong className="text-gold">Total Stock:</strong> <span className="text-gray-300">{totalStock} available</span></p>
              )}
              {/* Show stock for selected size */}
              <p>
                <strong className="text-gold">Stock ({selectedSize}):</strong>{' '}
                <span className={currentStock > 0 ? 'text-green-400' : 'text-red-400'}>
                  {currentStock > 0 ? `${currentStock} available` : 'Out of stock'}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-gold mb-2">Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value)
                  setQuantity(1) // Reset quantity when size changes
                }}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30"
              >
                {availableSizesList.map(size => {
                  const sizeStock = getStockForSize(size)
                  return (
                    <option key={size} value={size} disabled={sizeStock === 0}>
                      {size} {sizeStock > 0 ? `(${sizeStock} available)` : '(Out of stock)'}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-gold mb-2">Quantity:</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setQuantity(Math.max(1, Math.min(val, currentStock)))
                  }}
                  className="w-20 px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 text-center"
                />
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <span className="text-gray-400 text-sm">Max: {currentStock}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0 || quantity > currentStock}
                className="flex-1 px-6 py-3 border border-gold text-gold rounded-full hover:bg-gold hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentStock === 0 || quantity > currentStock}
                className="flex-1 px-6 py-3 bg-gold text-black rounded-full hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

