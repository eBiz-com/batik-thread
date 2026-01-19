'use client'

import { Product } from '@/lib/supabase'
import Image from 'next/image'

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export default function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No products found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-12">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-gold/30 transition-all cursor-pointer group"
          onClick={() => onProductClick(product)}
        >
          <div className="relative w-full aspect-[3/4] min-h-[256px] max-h-[400px] overflow-hidden bg-gray-800">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="p-4 text-center">
            <h3 className="font-serif text-gold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-300 font-semibold">${product.price}</p>
            <button className="mt-3 px-4 py-2 border border-gold text-gold rounded-full hover:bg-gold hover:text-black transition-all text-sm">
              Quick View
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

