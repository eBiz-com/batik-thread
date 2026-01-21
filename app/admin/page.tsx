'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Product, CustomRequest } from '@/lib/supabase'
import { LogOut, Plus, Trash2, Edit, Package, FileText, Database, Settings, Upload, Image as ImageIcon, X, DollarSign, RefreshCw, QrCode, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { getSettings, saveSettings, StoreSettings } from '@/lib/settings'

export default function AdminDashboard() {
  console.log('AdminDashboard component rendering')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'requests' | 'payments'>('products')
  const [recentReceipts, setRecentReceipts] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [requestStatus, setRequestStatus] = useState<'pending' | 'reviewed' | 'approved' | 'rejected' | 'completed'>('pending')
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ taxPercentage: 7.5, shippingHandling: 10.00 })
  const [showSettings, setShowSettings] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    gender: 'Men',
    color: '',
    fabric: '',
    origin: '',
    story: '',
    images: '',
    stock: '',
    stockS: '',
    stockM: '',
    stockL: '',
    stockXL: '',
  })
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Check if already logged in
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('admin_auth')
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  useEffect(() => {
    // Load data when authenticated
    if (isAuthenticated) {
      fetchProducts()
      fetchCustomRequests()
      loadSettings()
      fetchRecentPayments()
    }
  }, [isAuthenticated])

  // Real-time subscriptions for transactions and receipts
  useEffect(() => {
    if (!isAuthenticated) return

    console.log('Setting up real-time subscriptions...')

    // Subscribe to new transactions
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          console.log('New transaction detected:', payload.new)
          // Refresh payments data when new transaction is added
          fetchRecentPayments().catch(err => {
            console.error('Error refreshing after new transaction:', err)
          })
        }
      )
      .subscribe()

    // Subscribe to new receipts
    const receiptsChannel = supabase
      .channel('receipts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'receipts',
        },
        (payload) => {
          console.log('New receipt detected:', payload.new)
          // Refresh payments data when new receipt is added
          fetchRecentPayments().catch(err => {
            console.error('Error refreshing after new receipt:', err)
          })
        }
      )
      .subscribe()

    // Also set up polling as backup (every 10 seconds when on payments tab)
    let pollInterval: NodeJS.Timeout | null = null
    if (activeTab === 'payments') {
      pollInterval = setInterval(() => {
        fetchRecentPayments().catch(err => {
          console.error('Error polling payments:', err)
        })
      }, 10000) // Poll every 10 seconds
    }

    // Cleanup subscriptions and polling on unmount
    return () => {
      console.log('Cleaning up subscriptions...')
      supabase.removeChannel(transactionsChannel)
      supabase.removeChannel(receiptsChannel)
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [isAuthenticated, activeTab])

  useEffect(() => {
    // Fetch payments when payments tab is active
    if (isAuthenticated && activeTab === 'payments') {
      fetchRecentPayments().catch(err => {
        console.error('Error fetching payments:', err)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  const handleLogin = () => {
    if (username === 'admin' && password === 'batik2025') {
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'authenticated')
      fetchProducts()
      fetchCustomRequests()
      loadSettings()
      fetchRecentPayments()
      setLoginError('')
    } else {
      setLoginError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_auth')
    setUsername('')
    setPassword('')
  }

  // Helper function to get total stock for a product
  const getTotalStock = (product: Product): number => {
    if (product.stock_by_size && typeof product.stock_by_size === 'object') {
      const stockValues: number[] = Object.values(product.stock_by_size) as number[]
      return stockValues.reduce((sum: number, val: number) => sum + (val || 0), 0)
    }
    return product.stock || 0
  }

  // Helper function to check if product is low stock (1 or less)
  const isLowStock = (product: Product): boolean => {
    return getTotalStock(product) <= 1
  }

  // Helper function to check if product is out of stock
  const isOutOfStock = (product: Product): boolean => {
    return getTotalStock(product) === 0
  }

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
      } else if (data) {
        setProducts(data)
        
        // Check for low stock products and show notification
        const lowStockProducts = data.filter(p => isLowStock(p) && !isOutOfStock(p))
        const outOfStockProducts = data.filter(p => isOutOfStock(p))
        
        if (lowStockProducts.length > 0) {
          const productNames = lowStockProducts.map(p => p.name).join(', ')
          console.warn(`⚠️ Low Stock Alert: ${lowStockProducts.length} product(s) have only 1 quantity left: ${productNames}`)
          // You can also show a browser notification here if needed
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Low Stock Alert', {
              body: `${lowStockProducts.length} product(s) have only 1 quantity left: ${productNames}`,
              icon: '/favicon.ico'
            })
          }
        }
        
        if (outOfStockProducts.length > 0) {
          const productNames = outOfStockProducts.map(p => p.name).join(', ')
          console.warn(`🚫 Out of Stock: ${outOfStockProducts.length} product(s) are out of stock: ${productNames}`)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newImages = [...productImages, ...files].slice(0, 10) // Max 10 images
      setProductImages(newImages)

      // Create previews
      const previews = newImages.map(file => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
      const newImages = [...productImages, ...files].slice(0, 10)
      setProductImages(newImages)

      const previews = newImages.map(file => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const removeImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setProductImages(newImages)
    setImagePreviews(newPreviews)
    // Clean up object URLs
    URL.revokeObjectURL(imagePreviews[index])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert uploaded images to base64 or use URL input
      let imageUrls: string[] = []

      // If images were uploaded, convert to base64
      if (productImages.length > 0) {
        for (const image of productImages) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(image)
          })
          imageUrls.push(base64)
        }
      } else if (formData.images.trim()) {
        // Fallback to URL input if no files uploaded
        imageUrls = formData.images.split(',').map((url) => url.trim()).filter(Boolean)
      }

      if (imageUrls.length === 0) {
        alert('Please upload at least one product image')
        setIsLoading(false)
        return
      }

      // Build stock_by_size object if any size stocks are provided
      const stockBySize: { [key: string]: number } = {}
      if (formData.stockS) stockBySize.S = parseInt(formData.stockS)
      if (formData.stockM) stockBySize.M = parseInt(formData.stockM)
      if (formData.stockL) stockBySize.L = parseInt(formData.stockL)
      if (formData.stockXL) stockBySize.XL = parseInt(formData.stockXL)

      const productData: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        gender: formData.gender || null,
        color: formData.color || null,
        fabric: formData.fabric || null,
        origin: formData.origin || null,
        story: formData.story || null,
        images: imageUrls,
        // Handle optional columns that might exist in database
        category: null, // Set to null if column exists
        quality: null, // Set to null if column exists
        description: null, // Set to null if column exists
      }

      // Add stock_by_size if provided, otherwise use legacy stock field
      if (Object.keys(stockBySize).length > 0) {
        productData.stock_by_size = stockBySize
        // Calculate total stock for backward compatibility
        const stockValues: number[] = Object.values(stockBySize) as number[]
        productData.stock = stockValues.reduce((sum: number, val: number) => sum + val, 0)
      } else if (formData.stock) {
        productData.stock = parseInt(formData.stock)
      }

      // Remove null/undefined/empty values to avoid sending unnecessary data
      // This prevents errors with columns that don't exist or are optional
      const cleanedProductData = Object.fromEntries(
        Object.entries(productData).filter(([_, value]) => {
          if (value === null || value === undefined) return false
          if (typeof value === 'string' && value.trim() === '') return false
          return true
        })
      )

      console.log('Attempting to insert product:', cleanedProductData)

      const { data, error } = await supabase.from('products').insert([cleanedProductData]).select()

      if (error) {
        console.error('Error adding product:', error)
        const errorDetails = {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
        console.error('Error details:', errorDetails)
        console.error('Full error object:', error)
        alert(`Error adding product: ${error.message}\n\nCheck browser console (F12) for more details.`)
      } else {
        console.log('Product added successfully:', data)
        alert('Product added successfully!')
        setFormData({
          name: '',
          price: '',
          gender: 'Men',
          color: '',
          fabric: '',
          origin: '',
          story: '',
          images: '',
          stock: '',
          stockS: '',
          stockM: '',
          stockL: '',
          stockXL: '',
        })
        setProductImages([])
        setImagePreviews([])
        // Clean up object URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url))
        fetchProducts()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error adding product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product')
      } else {
        alert('Product deleted successfully!')
        fetchProducts()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting product')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomRequests = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching custom requests:', error)
      } else if (data) {
        setCustomRequests(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRequest = async (id: number, event?: React.MouseEvent) => {
    // Stop event propagation to prevent opening the modal
    if (event) {
      event.stopPropagation()
    }

    if (!confirm('Are you sure you want to delete this custom order request? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('custom_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting custom request:', error)
        alert('Error deleting custom request: ' + error.message)
      } else {
        alert('Custom request deleted successfully!')
        fetchCustomRequests()
        // Close modal if it's open for the deleted request
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(null)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting custom request')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentPayments = useCallback(async () => {
    try {
      setIsRefreshing(true)
      console.log('Fetching recent payments...')
      // Fetch recent receipts
      try {
        const receiptsResponse = await fetch('/api/receipts')
        console.log('Receipts response status:', receiptsResponse.status)
        if (receiptsResponse.ok) {
          const receiptsResult = await receiptsResponse.json()
          console.log('Receipts result:', receiptsResult)
          if (receiptsResult.success) {
            const receipts = receiptsResult.data || []
            console.log('Found receipts:', receipts.length)
            setRecentReceipts(receipts.slice(0, 10)) // Last 10 receipts
          } else {
            console.error('Receipts API returned error:', receiptsResult.error)
          }
        } else {
          const errorText = await receiptsResponse.text()
          console.error('Receipts API error response:', errorText)
        }
      } catch (receiptError) {
        console.error('Error fetching receipts:', receiptError)
        // Continue even if receipts fail
      }

      // Fetch recent transactions
      try {
        const transactionsResponse = await fetch('/api/transactions')
        console.log('Transactions response status:', transactionsResponse.status)
        if (transactionsResponse.ok) {
          const transactionsResult = await transactionsResponse.json()
          console.log('Transactions result:', transactionsResult)
          if (transactionsResult.success) {
            const transactions = transactionsResult.data || []
            console.log('Found transactions:', transactions.length)
            setRecentTransactions(transactions.slice(0, 10)) // Last 10 transactions

            // Calculate statistics
            const today = new Date().toISOString().split('T')[0]
            const todayTransactions = transactions.filter((t: any) => t.transaction_date === today)
            const completedTransactions = transactions.filter((t: any) => 
              t.payment_status === 'completed' || t.payment_status === 'transaction_closed'
            )
            const todayCompleted = todayTransactions.filter((t: any) => 
              t.payment_status === 'completed' || t.payment_status === 'transaction_closed'
            )

            const totalRevenue = completedTransactions.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0)
            const todayRevenue = todayCompleted.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0)

            console.log('Payment stats calculated:', { totalRevenue, todayRevenue, totalOrders: transactions.length, todayOrders: todayTransactions.length })

            setPaymentStats({
              totalRevenue,
              todayRevenue,
              totalOrders: transactions.length,
              todayOrders: todayTransactions.length,
            })
          } else {
            console.error('Transactions API returned error:', transactionsResult.error)
          }
        } else {
          const errorText = await transactionsResponse.text()
          console.error('Transactions API error response:', errorText)
        }
      } catch (transactionError) {
        console.error('Error fetching transactions:', transactionError)
        // Continue even if transactions fail
      }
    } catch (error) {
      console.error('Error in fetchRecentPayments:', error)
      // Don't crash the page if payments fail to load
    } finally {
      setIsRefreshing(false)
      setLastUpdate(new Date())
    }
  }, [])

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('custom_requests')
        .update({
          status: requestStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id)

      if (error) {
        console.error('Error updating request:', error)
        alert('Error updating request')
      } else {
        alert('Request updated successfully!')
        setSelectedRequest(null)
        setAdminNotes('')
        fetchCustomRequests()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating request')
    } finally {
      setIsLoading(false)
    }
  }

  const openRequestModal = (request: CustomRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || '')
    setRequestStatus(request.status)
  }

  const loadSettings = () => {
    if (typeof window !== 'undefined') {
      const settings = getSettings()
      setStoreSettings(settings)
    }
  }

  const handleSaveSettings = () => {
    saveSettings(storeSettings)
    alert('Settings saved successfully!')
    setShowSettings(false)
    // Refresh page to apply settings
    window.location.reload()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-bg-accent">
        <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-serif text-gold mb-6 text-center">Admin Login</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalProducts = products.length
  const inStock = products.filter((p) => (p.stock || 0) > 0).length
  const outOfStock = products.filter((p) => (p.stock || 0) === 0).length
  const pendingRequests = customRequests.filter((r) => r.status === 'pending').length
  const totalRequests = customRequests.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-gold">Batik & Thread Admin</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/receipt"
              className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all text-sm"
            >
              <FileText size={18} />
              Receipt
            </Link>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all text-sm"
            >
              <Settings size={18} />
              Settings
            </button>
            <Link
              href="/admin/setup"
              className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all text-sm"
            >
              <Database size={18} />
              Database Setup
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-900 p-6 rounded-xl mb-8 border border-purple-500/30">
            <h2 className="text-2xl font-serif text-gold mb-4 flex items-center gap-2">
              <Settings size={24} />
              Store Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gold text-sm mb-2">Tax Percentage (%)</label>
                <input
                  type="number"
                  value={storeSettings.taxPercentage}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxPercentage: parseFloat(e.target.value) || 0 })}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-gray-400 mt-1">Current: {storeSettings.taxPercentage}%</p>
              </div>
              <div>
                <label className="block text-gold text-sm mb-2">Shipping & Handling ($)</label>
                <input
                  type="number"
                  value={storeSettings.shippingHandling}
                  onChange={(e) => setStoreSettings({ ...storeSettings, shippingHandling: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-gray-400 mt-1">Current: ${storeSettings.shippingHandling.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold"
              >
                Save Settings
              </button>
              <button
                onClick={() => {
                  setStoreSettings({ taxPercentage: 7.5, shippingHandling: 10.00 })
                  setShowSettings(false)
                }}
                className="px-6 py-2 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded text-sm text-blue-300">
              <strong>Note:</strong> These settings will be applied to all new orders. Tax is calculated on subtotal, and shipping is a flat fee.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gold/20">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'text-gold border-b-2 border-gold'
                : 'text-gray-400 hover:text-gold'
            }`}
          >
            <Package size={20} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 relative ${
              activeTab === 'requests'
                ? 'text-gold border-b-2 border-gold'
                : 'text-gray-400 hover:text-gold'
            }`}
          >
            <FileText size={20} />
            Custom Requests
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'text-gold border-b-2 border-gold'
                : 'text-gray-400 hover:text-gold'
            }`}
          >
            <DollarSign size={20} />
            Payments & Receipts
          </button>
          <Link
            href="/admin/heritage-card"
            className="px-6 py-3 font-semibold transition-colors flex items-center gap-2 text-gray-400 hover:text-gold border-b-2 border-transparent hover:border-gold"
          >
            <QrCode size={20} />
            JTD eBiz Card™
          </Link>
          <Link
            href="/admin/receipts"
            className="px-6 py-3 font-semibold transition-colors flex items-center gap-2 text-gray-400 hover:text-gold border-b-2 border-transparent hover:border-gold"
          >
            <FileText size={20} />
            Receipt History
          </Link>
          <Link
            href="/admin/transactions"
            className="px-6 py-3 font-semibold transition-colors flex items-center gap-2 text-gray-400 hover:text-gold border-b-2 border-transparent hover:border-gold"
          >
            <DollarSign size={20} />
            Transactions
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Products</h3>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">In Stock</h3>
            <p className="text-2xl font-bold text-green-400">{inStock}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Pending Requests</h3>
            <p className="text-2xl font-bold text-yellow-400">{pendingRequests}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h3 className="text-gold mb-2">Total Requests</h3>
            <p className="text-2xl font-bold">{totalRequests}</p>
          </div>
        </div>

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <>
            {/* Add Product Form */}
            <div className="bg-gray-900 p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-serif text-gold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            />
            <input
              type="number"
              placeholder="Price ($)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              step="0.01"
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
            <input
              type="text"
              placeholder="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Fabric Type"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Origin"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
            />
            <textarea
              placeholder="Short Story / Description"
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows={2}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold md:col-span-2"
            />
            
            {/* Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-gold text-sm mb-2">Product Images</label>
              
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-gold bg-gold/10'
                    : 'border-gold/30 hover:border-gold/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image-upload"
                  disabled={productImages.length >= 10}
                />
                <label
                  htmlFor="product-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-gold' : 'text-gold/70'}`} />
                  <span className="text-gold text-sm">
                    {isDragging
                      ? 'Drop images here'
                      : productImages.length > 0
                      ? 'Click to add more images'
                      : 'Drag & drop images here or click to upload'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {productImages.length > 0
                      ? `${productImages.length}/10 images selected`
                      : 'Upload up to 10 images (JPG, PNG, etc.)'}
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gold/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-gold text-black text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback URL Input */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Or enter image URLs (comma-separated):</p>
                <input
                  type="text"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold text-sm"
                  disabled={productImages.length > 0}
                />
                {productImages.length > 0 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    URL input disabled when images are uploaded. Remove uploaded images to use URLs.
                  </p>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gold mb-2 text-sm">Stock by Size (leave empty for total stock):</label>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  placeholder="S"
                  value={formData.stockS}
                  onChange={(e) => setFormData({ ...formData, stockS: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="M"
                  value={formData.stockM}
                  onChange={(e) => setFormData({ ...formData, stockM: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="L"
                  value={formData.stockL}
                  onChange={(e) => setFormData({ ...formData, stockL: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="XL"
                  value={formData.stockXL}
                  onChange={(e) => setFormData({ ...formData, stockXL: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Or use total stock below if you don't need size-specific tracking</p>
            </div>
            <input
              type="number"
              placeholder="Total Stock (if not using size-specific)"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30 focus:outline-none focus:border-gold"
              min="0"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {isLoading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>

        {/* Low Stock Alert Banner */}
        {(() => {
          const lowStockProducts = products.filter(p => isLowStock(p) && !isOutOfStock(p))
          const outOfStockProducts = products.filter(p => isOutOfStock(p))
          
          if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
            return (
              <div className="mb-6 space-y-2">
                {lowStockProducts.length > 0 && (
                  <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="text-yellow-400" size={20} />
                    <div className="flex-1">
                      <p className="text-yellow-400 font-semibold">Low Stock Alert</p>
                      <p className="text-gray-300 text-sm">
                        {lowStockProducts.length} product(s) have only 1 quantity left: {lowStockProducts.map(p => p.name).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {outOfStockProducts.length > 0 && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="text-red-400" size={20} />
                    <div className="flex-1">
                      <p className="text-red-400 font-semibold">Out of Stock</p>
                      <p className="text-gray-300 text-sm">
                        {outOfStockProducts.length} product(s) are out of stock: {outOfStockProducts.map(p => p.name).join(', ')}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">These products are automatically hidden from the storefront.</p>
                    </div>
                  </div>
                )}
              </div>
            )
          }
          return null
        })()}

        {/* Products Table */}
        <div className="bg-gray-900 p-6 rounded-xl overflow-x-auto">
          <h2 className="text-2xl font-serif text-gold mb-4">Products</h2>
          {isLoading && products.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No products found. Add your first product above!</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left p-4 text-gold">ID</th>
                  <th className="text-left p-4 text-gold">Preview</th>
                  <th className="text-left p-4 text-gold">Name</th>
                  <th className="text-left p-4 text-gold">Price</th>
                  <th className="text-left p-4 text-gold">Gender</th>
                  <th className="text-left p-4 text-gold">Stock</th>
                  <th className="text-left p-4 text-gold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gold/10 hover:bg-gray-800">
                    <td className="p-4">{product.id}</td>
                    <td className="p-4">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="p-4">{product.name}</td>
                    <td className="p-4">${product.price}</td>
                    <td className="p-4">{product.gender}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const totalStock = getTotalStock(product)
                          const isLow = isLowStock(product)
                          const isOut = isOutOfStock(product)
                          
                          if (product.stock_by_size && typeof product.stock_by_size === 'object') {
                            const stockBySize = product.stock_by_size as { [key: string]: number }
                            return (
                              <div className="flex flex-col gap-1">
                                <span className={isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-green-400'}>
                                  Total: {totalStock}
                                  {isLow && !isOut && <AlertTriangle size={14} className="inline-block ml-1" />}
                                  {isOut && <span className="text-xs"> (OUT OF STOCK)</span>}
                                </span>
                                <div className="text-xs text-gray-400">
                                  {Object.entries(stockBySize).map(([size, stock]) => (
                                    <span key={size} className={stock === 0 ? 'text-red-400' : stock === 1 ? 'text-yellow-400' : ''}>
                                      {size}:{stock}{' '}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                          return (
                            <span className={isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-green-400'}>
                              {totalStock}
                              {isLow && !isOut && <AlertTriangle size={14} className="inline-block ml-1" />}
                              {isOut && <span className="text-xs ml-1">(OUT OF STOCK)</span>}
                            </span>
                          )
                        })()}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
          </>
        )}

        {/* Payments Tab Content */}
        {activeTab === 'payments' && (
          <>
            {/* Payment Statistics */}
            {lastUpdate && (
              <div className="mb-4 text-sm text-gray-400 text-right">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 p-6 rounded-xl text-center">
                <h3 className="text-gold mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-400">${paymentStats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl text-center">
                <h3 className="text-gold mb-2">Today's Revenue</h3>
                <p className="text-2xl font-bold text-gold">${paymentStats.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl text-center">
                <h3 className="text-gold mb-2">Total Orders</h3>
                <p className="text-2xl font-bold">{paymentStats.totalOrders}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-xl text-center">
                <h3 className="text-gold mb-2">Today's Orders</h3>
                <p className="text-2xl font-bold text-blue-400">{paymentStats.todayOrders}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-900 p-6 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-serif text-gold-light">Recent Transactions</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchRecentPayments()}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-3 py-1.5 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all text-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Refresh data"
                  >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <Link
                    href="/admin/transactions"
                    className="text-gold hover:text-gold-light text-sm"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transactions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gold/20">
                        <th className="text-left p-3 text-gold text-sm">Receipt #</th>
                        <th className="text-left p-3 text-gold text-sm">Date</th>
                        <th className="text-left p-3 text-gold text-sm">Customer</th>
                        <th className="text-right p-3 text-gold text-sm">Amount</th>
                        <th className="text-center p-3 text-gold text-sm">Status</th>
                        <th className="text-center p-3 text-gold text-sm">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gold/10 hover:bg-gray-800">
                          <td className="p-3 font-mono text-sm">{transaction.receipt_number}</td>
                          <td className="p-3 text-sm">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                          <td className="p-3 text-sm">{transaction.customer_name}</td>
                          <td className="p-3 text-right font-semibold text-gold text-sm">${transaction.total_amount.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              transaction.payment_status === 'completed' ? 'bg-green-900/50 text-green-300' :
                              transaction.payment_status === 'refunded' ? 'bg-red-900/50 text-red-300' :
                              'bg-blue-900/50 text-blue-300'
                            }`}>
                              {transaction.payment_status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-center text-xs text-gray-400">
                            {transaction.transaction_source === 'checkout' ? 'Online' : 'Admin'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Receipts */}
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-serif text-gold-light">Recent Receipts</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchRecentPayments()}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gold text-gold rounded-lg hover:bg-gold hover:text-black transition-all text-sm"
                    title="Refresh data"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                  <Link
                    href="/admin/receipts"
                    className="text-gold hover:text-gold-light text-sm"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              {recentReceipts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No receipts yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gold/20">
                        <th className="text-left p-3 text-gold text-sm">Receipt #</th>
                        <th className="text-left p-3 text-gold text-sm">Date</th>
                        <th className="text-left p-3 text-gold text-sm">Customer</th>
                        <th className="text-left p-3 text-gold text-sm">Phone</th>
                        <th className="text-right p-3 text-gold text-sm">Total</th>
                        <th className="text-center p-3 text-gold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReceipts.map((receipt) => {
                        const items = typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items
                        return (
                          <tr key={receipt.id} className="border-b border-gold/10 hover:bg-gray-800">
                            <td className="p-3 font-mono text-sm">{receipt.receipt_number}</td>
                            <td className="p-3 text-sm">{new Date(receipt.receipt_date).toLocaleDateString()}</td>
                            <td className="p-3 text-sm">{receipt.customer_name}</td>
                            <td className="p-3 text-sm">{receipt.customer_phone || 'N/A'}</td>
                            <td className="p-3 text-right font-semibold text-gold text-sm">${receipt.grand_total.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <Link
                                href={`/admin/receipts?view=${receipt.id}`}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Custom Requests Tab Content */}
        {activeTab === 'requests' && (
          <div className="bg-gray-900 p-6 rounded-xl overflow-x-auto">
            <h2 className="text-2xl font-serif text-gold mb-4">Custom Order Requests</h2>
            {isLoading && customRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Loading requests...</p>
            ) : customRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No custom requests yet.</p>
            ) : (
              <div className="space-y-4">
                {customRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-800 p-4 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors cursor-pointer"
                    onClick={() => openRequestModal(request)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-gold font-semibold">{request.event_name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              request.status === 'pending'
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : request.status === 'approved'
                                ? 'bg-green-900/50 text-green-300'
                                : request.status === 'rejected'
                                ? 'bg-red-900/50 text-red-300'
                                : request.status === 'completed'
                                ? 'bg-blue-900/50 text-blue-300'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">
                          <strong>Customer:</strong> {request.customer_name} ({request.customer_email})
                        </p>
                        <p className="text-gray-300 text-sm mb-1">
                          <strong>Event Date:</strong> {new Date(request.event_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <strong>Quantity:</strong> {request.quantity} pieces | <strong>Sizes:</strong> {request.sizes}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        <button
                          onClick={(e) => handleDeleteRequest(request.id, e)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete request"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-gold-light">Request Details</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDeleteRequest(selectedRequest.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 rounded-lg transition-colors text-sm"
                    title="Delete this request"
                  >
                    <Trash2 size={18} />
                    Delete Request
                  </button>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gold hover:text-gold-light text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-gold mb-2">Customer Information</h3>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedRequest.customer_name}</p>
                    <p><strong>Email:</strong> {selectedRequest.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedRequest.customer_phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-gold mb-2">Event Details</h3>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Event Name:</strong> {selectedRequest.event_name}</p>
                    <p><strong>Event Date:</strong> {new Date(selectedRequest.event_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-gold mb-2">Order Details</h3>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Quantity:</strong> {selectedRequest.quantity} pieces</p>
                    <p><strong>Sizes:</strong> {selectedRequest.sizes}</p>
                    <p><strong>Description:</strong></p>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
                </div>

                {selectedRequest.style_images && selectedRequest.style_images.length > 0 && (
                  <div>
                    <h3 className="text-gold mb-2">Style Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRequest.style_images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Style ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-gold/20 pt-4">
                <div>
                  <label className="block text-gold text-sm mb-2">Status</label>
                  <select
                    value={requestStatus}
                    onChange={(e) => setRequestStatus(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gold border border-gold/30"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gold text-sm mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gold/30"
                    placeholder="Add notes about this request..."
                  />
                </div>

                <button
                  onClick={handleUpdateRequest}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold-light transition-all font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

