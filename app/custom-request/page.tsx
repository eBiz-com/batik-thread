'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Calendar, Users, Ruler, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Extend Window interface for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string
      execute: (widgetId: string | HTMLElement) => void
      reset: (widgetId: string | HTMLElement) => void
    }
  }
}

export default function CustomRequestPage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_name: '',
    event_date: '',
    quantity: '',
    sizes: '',
    description: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formStartTime] = useState(() => Date.now())
  const [honeypot, setHoneypot] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)
  const turnstileTokenRef = useRef<string | null>(null)

  // Load Cloudflare Turnstile script and initialize
  useEffect(() => {
    if (typeof window !== 'undefined' && turnstileRef.current) {
      // Load Turnstile script
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        // Initialize Turnstile after script loads
        if (window.turnstile) {
          const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA' // Test key
          const widgetId = window.turnstile.render(turnstileRef.current!, {
            sitekey: siteKey,
            size: 'invisible',
            callback: (token: string) => {
              console.log('Turnstile token received')
              turnstileTokenRef.current = token
              setTurnstileToken(token)
              // DO NOT auto-submit - user must click submit button
            },
            'error-callback': () => {
              console.error('Turnstile error callback')
              setTurnstileToken(null)
              setError('Security verification failed. Please refresh the page and try again.')
            },
          })
          turnstileWidgetIdRef.current = widgetId
        }
      }
      document.head.appendChild(script)

      return () => {
        // Cleanup
        const existingScript = document.querySelector('script[src*="turnstile"]')
        if (existingScript) {
          existingScript.remove()
        }
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newImages = [...images, ...files].slice(0, 5) // Max 5 images
      setImages(newImages)

      // Create previews
      const previews = newImages.map(file => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      console.warn('Bot detected: honeypot field was filled')
      setError('Invalid submission detected. Please try again.')
      return
    }

    // Check minimum form fill time (at least 5 seconds)
    const formFillTime = Date.now() - formStartTime
    if (formFillTime < 5000) {
      console.warn('Suspicious: Form submitted too quickly', formFillTime)
      setError(`Please take more time to fill out the form completely.`)
      return
    }
    
    // Check if Turnstile is available
    if (typeof window === 'undefined' || !window.turnstile) {
      setError('Security verification is not available. Please refresh the page and try again.')
      return
    }

    // Check if we already have a valid token
    if (!turnstileTokenRef.current && !turnstileToken) {
      // Execute Turnstile challenge and wait for token
      try {
        // Reset token first
        turnstileTokenRef.current = null
        setTurnstileToken(null)
        
        // Execute Turnstile challenge
        const widgetId = turnstileWidgetIdRef.current || turnstileRef.current
        if (!widgetId) {
          setError('Security verification widget not found. Please refresh the page and try again.')
          return
        }
        
        console.log('Executing Turnstile challenge...')
        window.turnstile.execute(widgetId)
        
        // Wait for token with timeout (max 5 seconds)
        let attempts = 0
        const maxAttempts = 50 // 50 * 100ms = 5 seconds
        while (!turnstileTokenRef.current && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        // Check if we got a token
        if (!turnstileTokenRef.current) {
          console.error('Turnstile token not received after 5 seconds')
          setError('Security verification is taking too long. Please refresh the page and try again.')
          return
        }
        
        // Update state with the token from ref
        setTurnstileToken(turnstileTokenRef.current)
        console.log('Turnstile token ready for submission')
      } catch (error) {
        console.error('Turnstile execution error:', error)
        setError('Security verification failed. Please refresh the page and try again.')
        return
      }
    }
    
    // Final verification - REQUIRED for submission
    const finalToken = turnstileTokenRef.current || turnstileToken
    if (!finalToken) {
      console.error('No Turnstile token available for submission')
      setError('Security verification is required. Please refresh the page and try again.')
      return
    }

    setLoading(true)

    try {
      // Upload images to Supabase storage (or convert to base64 for demo)
      const imageUrls: string[] = []

      // For demo, we'll convert images to base64
      // In production, upload to Supabase Storage
      for (const image of images) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(image)
        })
        imageUrls.push(base64)
      }

      // Submit request to API
      const response = await fetch('/api/custom-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          style_images: imageUrls,
          form_fill_time: Date.now() - formStartTime,
          turnstile_token: turnstileTokenRef.current || turnstileToken,
          company: honeypot, // Honeypot field
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        // Reset form
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          event_name: '',
          event_date: '',
          quantity: '',
          sizes: '',
          description: '',
        })
        setImages([])
        setImagePreviews([])
        setTurnstileToken(null)
        // Reset Turnstile
        if (typeof window !== 'undefined' && window.turnstile && turnstileRef.current) {
          window.turnstile.reset(turnstileRef.current)
        }
      } else {
        throw new Error(data.error || 'Failed to submit request')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.')
      // Reset Turnstile on error
      setTurnstileToken(null)
      if (typeof window !== 'undefined' && window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current)
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-gold-light mb-4">Request Submitted!</h1>
          <p className="text-gray-300 mb-6">
            Thank you for your custom order request. We'll review it and get back to you soon.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gold text-black rounded-full hover:bg-gold-light transition-all font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-bg-accent py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-gray-900 rounded-xl p-8">
          <h1 className="text-3xl font-serif text-gold-light mb-2">Custom Order Request</h1>
          <p className="text-gray-400 mb-8">
            Request bulk sewing for your event. Fill out the form below and we'll get back to you with a quote.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">

            {/* Customer Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif text-gold border-b border-gold/20 pb-2">Customer Information</h2>
              
              <div>
                <label className="block text-gold text-sm mb-2">Full Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gold text-sm mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                    autoComplete="tel"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    placeholder="+1 (321) 961-6566"
                  />
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif text-gold border-b border-gold/20 pb-2">Event Details</h2>
              
              <div>
                <label className="block text-gold text-sm mb-2">Event Name *</label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  placeholder="Wedding, Birthday Party, Corporate Event, etc."
                />
              </div>

              <div>
                <label className="block text-gold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Date *
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif text-gold border-b border-gold/20 pb-2">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-gold text-sm mb-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Sizes *
                  </label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                    placeholder="S: 5, M: 10, L: 8, XL: 2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specify sizes and quantities (e.g., "S: 5, M: 10, L: 8")</p>
                </div>
              </div>

              <div>
                <label className="block text-gold text-sm mb-2">Description / Special Requirements *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gold/30 focus:outline-none focus:border-gold"
                  placeholder="Describe your design preferences, fabric choices, colors, or any special requirements..."
                />
              </div>
            </div>

            {/* Style Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif text-gold border-b border-gold/20 pb-2">Style Images (Optional)</h2>
              <p className="text-gray-400 text-sm">Upload up to 5 reference images for your design</p>
              
              <div>
                <label className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gold/30 rounded-lg cursor-pointer hover:border-gold transition-colors">
                  <ImageIcon className="w-5 h-5 text-gold" />
                  <span className="text-gold">Upload Style Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={images.length >= 5}
                  />
                </label>
                {images.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {images.length}/5 images selected
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cloudflare Turnstile (Invisible) */}
            <div ref={turnstileRef} className="hidden"></div>
            
            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link
                href="/"
                className="flex-1 px-6 py-3 border border-gold text-gold rounded-full hover:bg-gold hover:text-black transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="flex-1 px-6 py-3 bg-gold text-black rounded-full hover:bg-gold-light transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

