'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { supabase, Product, CartItem } from '@/lib/supabase'
import ProductGrid from '@/components/ProductGrid'
import ProductModal from '@/components/ProductModal'
import CartModal from '@/components/CartModal'
import Filters from '@/components/Filters'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [filters, setFilters] = useState({
    gender: 'all',
    color: 'all',
    maxPrice: 250,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, filters])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Error fetching products:', error)
        // Fallback to demo products if Supabase fails
        setProducts(getDemoProducts())
        return
      }

      if (data && data.length > 0) {
        // Filter out products with no stock (only show products with stock > 0)
        const availableProducts = data.filter((product: Product) => {
          // Check stock_by_size first
          if (product.stock_by_size && typeof product.stock_by_size === 'object') {
            const totalStock = Object.values(product.stock_by_size).reduce((sum, val) => sum + (val || 0), 0)
            return totalStock > 0
          }
          // Fallback to legacy stock field
          return (product.stock || 0) > 0
        })
        setProducts(availableProducts)
      } else {
        // Use demo products if no data in Supabase
        setProducts(getDemoProducts())
      }
    } catch (error) {
      console.error('Error:', error)
      setProducts(getDemoProducts())
    }
  }

  const getDemoProducts = (): Product[] => {
    return [
      {
        id: 1,
        name: 'Urban Kente Set',
        price: 150,
        gender: 'Men',
        color: 'gold',
        fabric: 'Kente Cotton',
        origin: 'Ghana',
        story: 'A modern twist on traditional Kente, blending streetwear boldness with African pride.',
        images: [
          'https://images.pexels.com/photos/7651065/pexels-photo-7651065.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/11013280/pexels-photo-11013280.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        stock: 10,
      },
      {
        id: 2,
        name: 'Adire Street Flow',
        price: 120,
        gender: 'Women',
        color: 'blue',
        fabric: 'Indigo Adire',
        origin: 'Nigeria',
        story: 'Adire masterpiece merging Yoruba indigo art with modern city flair.',
        images: [
          'https://images.pexels.com/photos/9835649/pexels-photo-9835649.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/9835650/pexels-photo-9835650.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        stock: 8,
      },
      {
        id: 3,
        name: 'Golden Lace Radiance',
        price: 220,
        gender: 'Women',
        color: 'gold',
        fabric: 'Lace',
        origin: 'Nigeria',
        story: 'Opulent gold lace with detailed embroidery that shines at any occasion.',
        images: [
          'https://images.pexels.com/photos/7640906/pexels-photo-7640906.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/7639416/pexels-photo-7639416.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        stock: 5,
      },
      {
        id: 4,
        name: 'Ankara Rebel Jacket',
        price: 180,
        gender: 'Men',
        color: 'red',
        fabric: 'Ankara',
        origin: 'Nigeria',
        story: 'Bold Ankara prints meet streetwear energy in this stylish urban jacket.',
        images: [
          'https://images.pexels.com/photos/6030228/pexels-photo-6030228.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/7640696/pexels-photo-7640696.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        stock: 12,
      },
      {
        id: 5,
        name: 'Ebony Queen Dress',
        price: 200,
        gender: 'Women',
        color: 'black',
        fabric: 'Silk Blend',
        origin: 'Kenya',
        story: 'Flowing black silk with subtle gold trims that redefine elegance.',
        images: [
          'https://images.pexels.com/photos/9840079/pexels-photo-9840079.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/9840081/pexels-photo-9840081.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        stock: 7,
      },
      {
        id: 6,
        name: 'Little Kente Joy',
        price: 95,
        gender: 'Kids',
        color: 'green',
        fabric: 'Kente Cotton',
        origin: 'Ghana',
        story: 'Bright and cheerful Kente outfit for kids, celebrating color and heritage.',
        images: [
          'https://images.pexels.com/photos/1648374/pexels-photo-1648374.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/9772458/pexels-photo-9772458.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        stock: 15,
      },
    ]
  }

  const applyFilters = () => {
    let filtered = [...products]

    if (filters.gender !== 'all') {
      filtered = filtered.filter((p) => p.gender === filters.gender)
    }

    if (filters.color !== 'all') {
      filtered = filtered.filter((p) => p.color === filters.color)
    }

    filtered = filtered.filter((p) => p.price <= filters.maxPrice)

    setFilteredProducts(filtered)
  }

  const addToCart = (item: CartItem) => {
    setCart([...cart, item])
    setIsProductModalOpen(false)
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const updateCartQuantity = (index: number, quantity: number) => {
    const updatedCart = [...cart]
    updatedCart[index].quantity = quantity
    setCart(updatedCart)
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const getOrderBreakdown = () => {
    const subtotal = getTotalPrice()
    // Settings will be loaded in CartModal component
    return { subtotal }
  }

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gold/20">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#hero" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.jpg"
              alt="Batik & Thread Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-serif text-gold glimmer hidden sm:inline">
              Batik & Thread
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            <a href="#hero" className="hover:text-gold transition-colors">Home</a>
            <a href="#shop" className="hover:text-gold transition-colors">Shop</a>
            <a href="/custom-request" className="hover:text-gold transition-colors">Custom Order</a>
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gold"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-gold hover:text-gold-light transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gold/20">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#hero" className="hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="#shop" className="hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Shop</a>
              <a href="/custom-request" className="hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Custom Order</a>
              <a href="#about" className="hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="#contact" className="hover:text-gold transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Shop Section */}
      <section id="shop" className="py-12">
        <div className="container mx-auto px-4">
          <Filters filters={filters} setFilters={setFilters} />
          <ProductGrid products={filteredProducts} onProductClick={openProductModal} />
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Product Modal */}
      {isProductModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setIsProductModalOpen(false)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          total={getTotalPrice()}
        />
      )}
    </main>
  )
}

