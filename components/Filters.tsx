'use client'

import { useMemo } from 'react'
import { Product } from '@/lib/supabase'

interface FiltersProps {
  filters: {
    gender: string
    color: string
    maxPrice: number
  }
  setFilters: (filters: any) => void
  products: Product[]
}

export default function Filters({ filters, setFilters, products }: FiltersProps) {
  // Get unique colors from actual products
  const availableColors = useMemo(() => {
    const colors = new Set<string>()
    products.forEach(product => {
      if (product.color && product.color.trim()) {
        colors.add(product.color.toLowerCase().trim())
      }
    })
    return Array.from(colors).sort()
  }, [products])

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 py-8 px-4">
      <select
        value={filters.gender}
        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        className="px-4 py-2 rounded-full bg-gray-800 text-gold border-none outline-none"
      >
        <option value="all">All Genders</option>
        <option value="Men">Men</option>
        <option value="Women">Women</option>
        <option value="Kids">Kids</option>
      </select>

      <select
        value={filters.color}
        onChange={(e) => setFilters({ ...filters, color: e.target.value })}
        className="px-4 py-2 rounded-full bg-gray-800 text-gold border-none outline-none"
      >
        <option value="all">All Colors</option>
        {availableColors.length > 0 ? (
          availableColors.map(color => (
            <option key={color} value={color}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </option>
          ))
        ) : (
          // Fallback to common colors if no products yet
          <>
            <option value="gold">Gold</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="brown">Brown</option>
            <option value="purple">Purple</option>
            <option value="pink">Pink</option>
            <option value="orange">Orange</option>
            <option value="yellow">Yellow</option>
            <option value="gray">Gray</option>
            <option value="grey">Grey</option>
            <option value="multicolor">Multicolor</option>
          </>
        )}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-gold-light">Max Price: </label>
        <span className="text-gold-light">${filters.maxPrice}</span>
        <input
          type="range"
          min="50"
          max="250"
          step="10"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
          className="w-32"
        />
      </div>
    </div>
  )
}

