'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase, ContactCardSettings } from '@/lib/supabase'
import { Phone, MessageCircle, Globe, MapPin, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function HeritageCardPage() {
  const params = useParams()
  const cardId = params.id as string
  const [settings, setSettings] = useState<ContactCardSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cardId) {
      fetchCardSettings()
    }
  }, [cardId])

  const fetchCardSettings = async () => {
    setIsLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('contact_card_settings')
        .select('*')
        .eq('card_id', cardId)
        .single()

      if (fetchError) {
        console.error('Error fetching card settings:', fetchError)
        setError('Card not found')
      } else if (data) {
        setSettings(data)
      } else {
        setError('Card not found')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load card')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneClick = () => {
    if (settings?.phone_number) {
      window.location.href = `tel:${settings.phone_number.replace(/\s/g, '')}`
    }
  }

  const handleWhatsAppClick = () => {
    if (settings?.whatsapp_number) {
      const cleanNumber = settings.whatsapp_number.replace(/[^\d+]/g, '')
      window.open(`https://wa.me/${cleanNumber}`, '_blank')
    }
  }

  const handleMapClick = () => {
    if (settings?.event_address) {
      const encodedAddress = encodeURIComponent(settings.event_address)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading contact card...</p>
        </div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Card not found'}</p>
          <Link href="/" className="text-amber-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Main Card */}
      <div className="max-w-md mx-auto p-6 pt-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-200">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-8 text-center">
            {settings.company_logo_url && (
              <div className="mb-6">
                <img
                  src={settings.company_logo_url}
                  alt={settings.company_name}
                  className="w-24 h-24 mx-auto object-contain rounded-full bg-white p-2"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold mb-2">{settings.company_name}</h1>
            <p className="text-amber-100 text-lg font-semibold mb-1">{settings.company_theme}</p>
            <p className="text-amber-200 text-sm">{settings.company_tagline}</p>
          </div>

          {/* Contact Information */}
          <div className="p-8 space-y-6">
            {/* Location */}
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-gray-600">{settings.location_city}, {settings.location_state}</p>
              </div>
            </div>

            {/* Phone - Click to Call */}
            <button
              onClick={handlePhoneClick}
              className="w-full flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-left"
            >
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Call Us</p>
                <p className="text-amber-700">{settings.phone_number}</p>
              </div>
            </button>

            {/* WhatsApp - Click to Chat */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Chat with Us</p>
                <p className="text-green-700">WhatsApp</p>
              </div>
            </button>

            {/* Website Link - Only if enabled */}
            {settings.show_website && settings.website_url && (
              <a
                href={settings.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Visit Website</p>
                  <p className="text-blue-700 text-sm">{settings.company_name || 'Our Website'}</p>
                </div>
              </a>
            )}

            {/* Event Information - Only if enabled */}
            {settings.show_event && settings.event_name && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Event</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">{settings.event_name}</p>
                {settings.event_address && (
                  <button
                    onClick={handleMapClick}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left mb-3"
                  >
                    <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700 flex-1">{settings.event_address}</p>
                    <span className="text-xs text-amber-600">Open Map</span>
                  </button>
                )}
                {settings.event_website_url && (
                  <a
                    href={settings.event_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-700 flex-1">
                      {settings.event_website_name || 'Event Website'}
                    </p>
                    <span className="text-xs text-blue-600">Visit</span>
                  </a>
                )}
              </div>
            )}

            {/* Stand Number - Only if enabled */}
            {settings.show_stand_number && settings.stand_number && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Stand Number</h3>
                </div>
                <p className="text-2xl font-bold text-amber-600">{settings.stand_number}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-amber-50 p-6 text-center border-t border-amber-200">
            <p className="text-xs text-gray-600">JTD eBiz Card™ by {settings.company_name}</p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-amber-600 hover:underline text-sm">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

