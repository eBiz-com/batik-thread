'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, ContactCardSettings } from '@/lib/supabase'
import { Save, Upload, QrCode, Printer, Phone, MessageCircle, Globe, MapPin, Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

export default function HeritageCardAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [cardId, setCardId] = useState<string>('default')
  
  const [settings, setSettings] = useState<ContactCardSettings>({
    id: 0,
    company_name: 'Batik & Thread',
    company_theme: 'Modern African Luxury Boutique',
    company_tagline: 'Smart Signage. Bold. Refined. Rooted in Heritage.',
    company_logo_url: '',
    location_city: 'Kissimmee',
    location_state: 'FL',
    phone_number: '+1 (321) 961-6566',
    whatsapp_number: '+1 (321) 961-6566',
    show_website: false,
    website_url: '',
    show_event: false,
    event_name: '',
    event_address: '',
    show_stand_number: false,
    stand_number: '',
    qr_code_url: '',
    card_id: 'default',
    created_at: new Date().toISOString(),
  })

  const printFrontRef = useRef<HTMLDivElement>(null)
  const printBackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('admin_auth')
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true)
        fetchSettings()
      }
    }
  }, [cardId])

  const handleLogin = () => {
    if (username === 'admin' && password === 'batik2025') {
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'authenticated')
      fetchSettings()
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

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_card_settings')
        .select('*')
        .eq('card_id', cardId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - use default values
          console.log('No existing settings found, using defaults')
          // Keep the default state values
        } else {
          console.error('Error fetching settings:', error)
          alert(`Error loading settings: ${error.message}`)
        }
      } else if (data) {
        console.log('Loaded settings:', data)
        // Update settings with fetched data
        setSettings({
          id: data.id || 0,
          company_name: data.company_name || 'Batik & Thread',
          company_theme: data.company_theme || 'Modern African Luxury Boutique',
          company_tagline: data.company_tagline || 'Smart Signage. Bold. Refined. Rooted in Heritage.',
          company_logo_url: data.company_logo_url || '',
          location_city: data.location_city || 'Kissimmee',
          location_state: data.location_state || 'FL',
          phone_number: data.phone_number || '+1 (321) 961-6566',
          whatsapp_number: data.whatsapp_number || '+1 (321) 961-6566',
          show_website: data.show_website || false,
          website_url: data.website_url || '',
          show_event: data.show_event || false,
          event_name: data.event_name || '',
          event_address: data.event_address || '',
          show_stand_number: data.show_stand_number || false,
          stand_number: data.stand_number || '',
          qr_code_url: data.qr_code_url || '',
          card_id: data.card_id || 'default',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at,
        })
        // Generate QR code URL if not set
        if (!data.qr_code_url && typeof window !== 'undefined') {
          const qrUrl = `${window.location.origin}/heritage-card/${data.card_id || 'default'}`
          setSettings(prev => ({ ...prev, qr_code_url: qrUrl }))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to load settings. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Generate QR code URL
      const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/heritage-card/${settings.card_id}`
      
      // Prepare update data, excluding id and timestamps for insert
      const saveData: any = {
        company_name: settings.company_name,
        company_theme: settings.company_theme,
        company_tagline: settings.company_tagline,
        company_logo_url: settings.company_logo_url || null,
        location_city: settings.location_city,
        location_state: settings.location_state,
        phone_number: settings.phone_number,
        whatsapp_number: settings.whatsapp_number,
        show_website: settings.show_website,
        website_url: settings.website_url || null,
        show_event: settings.show_event,
        event_name: settings.event_name || null,
        event_address: settings.event_address || null,
        show_stand_number: settings.show_stand_number,
        stand_number: settings.stand_number || null,
        qr_code_url: qrUrl,
        card_id: settings.card_id,
        updated_at: new Date().toISOString(),
      }

      // Check if record exists
      const { data: existing, error: checkError } = await supabase
        .from('contact_card_settings')
        .select('id')
        .eq('card_id', settings.card_id)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing record:', checkError)
        alert(`Error: ${checkError.message}`)
        setIsSaving(false)
        return
      }

      let error
      if (existing) {
        // Update existing
        console.log('Updating existing record:', existing.id)
        const { error: updateError } = await supabase
          .from('contact_card_settings')
          .update(saveData)
          .eq('card_id', settings.card_id)
        error = updateError
      } else {
        // Insert new
        console.log('Inserting new record')
        const { error: insertError } = await supabase
          .from('contact_card_settings')
          .insert([saveData])
        error = insertError
      }

      if (error) {
        console.error('Error saving settings:', error)
        alert(`Error saving settings: ${error.message}`)
      } else {
        alert('Settings saved successfully!')
        // Reload settings to get the updated data
        await fetchSettings()
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert(`Error saving settings: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, we'll use a placeholder. In production, upload to Supabase Storage
    const reader = new FileReader()
    reader.onloadend = () => {
      setSettings(prev => ({ ...prev, company_logo_url: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handlePrint = () => {
    // Trigger print dialog
    window.print()
  }

  const getQRCodeValue = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/heritage-card/${settings.card_id}`
    }
    return ''
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-amber-900 mb-2 text-center">JTD eBiz Card™ Admin</h1>
          <p className="text-gray-600 mb-6 text-center">Manage your digital contact card</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm text-center">{loginError}</div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 no-print">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-amber-900">JTD eBiz Card™ Manager</h1>
              <p className="text-sm text-gray-600">Manage your digital contact card</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <div className="space-y-6">
              {/* Company Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settings.company_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Theme</label>
                    <input
                      type="text"
                      value={settings.company_theme}
                      onChange={(e) => setSettings(prev => ({ ...prev, company_theme: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Tagline</label>
                    <input
                      type="text"
                      value={settings.company_tagline}
                      onChange={(e) => setSettings(prev => ({ ...prev, company_tagline: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg cursor-pointer hover:bg-amber-200 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </label>
                      {settings.company_logo_url && (
                        <img src={settings.company_logo_url} alt="Logo" className="w-16 h-16 object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={settings.location_city}
                        onChange={(e) => setSettings(prev => ({ ...prev, location_city: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={settings.location_state}
                        onChange={(e) => setSettings(prev => ({ ...prev, location_state: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={settings.phone_number}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone_number: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Sections */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-4">Optional Sections</h2>
                
                <div className="space-y-4">
                  {/* Website Section */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 font-medium text-gray-700">
                        <Globe className="w-4 h-4" />
                        Show Website Link
                      </label>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, show_website: !prev.show_website }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.show_website ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.show_website ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {settings.show_website && (
                      <input
                        type="url"
                        value={settings.website_url || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, website_url: e.target.value }))}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                      />
                    )}
                  </div>

                  {/* Event Section */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 font-medium text-gray-700">
                        <MapPin className="w-4 h-4" />
                        Show Event Information
                      </label>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, show_event: !prev.show_event }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.show_event ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.show_event ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {settings.show_event && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={settings.event_name || ''}
                          onChange={(e) => setSettings(prev => ({ ...prev, event_name: e.target.value }))}
                          placeholder="Event Name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                        />
                        <input
                          type="text"
                          value={settings.event_address || ''}
                          onChange={(e) => setSettings(prev => ({ ...prev, event_address: e.target.value }))}
                          placeholder="Full Event Address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* Stand Number Section */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 font-medium text-gray-700">
                        <Building2 className="w-4 h-4" />
                        Show Stand Number
                      </label>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, show_stand_number: !prev.show_stand_number }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.show_stand_number ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.show_stand_number ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {settings.show_stand_number && (
                      <input
                        type="text"
                        value={settings.stand_number || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, stand_number: e.target.value }))}
                        placeholder="Stand #"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Preview & QR Code */}
            <div className="space-y-6">
              {/* QR Code Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code
                </h2>
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  {getQRCodeValue() && (
                    <QRCodeSVG
                      value={getQRCodeValue()}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="mb-4"
                    />
                  )}
                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code to view the contact card
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-2 break-all">
                    {getQRCodeValue()}
                  </p>
                </div>
              </div>

              {/* Print Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  Print Card
                </h2>
                <button
                  onClick={handlePrint}
                  className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Generate Print Preview
                </button>
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Generate a print-ready version of your contact card
                </p>
              </div>

              {/* Live Preview Link */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-100">
                <h2 className="text-xl font-bold text-amber-900 mb-4">Live Preview</h2>
                <Link
                  href={`/heritage-card/${settings.card_id}`}
                  target="_blank"
                  className="block w-full bg-amber-100 text-amber-800 py-3 rounded-lg font-semibold hover:bg-amber-200 transition-colors text-center"
                >
                  View Live Card
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Preview - Hidden until print */}
      <div className="hidden print:block">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: 3.5in 2in;
              margin: 0.25in;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            body * {
              visibility: hidden;
            }
            .print-card-front,
            .print-card-back {
              visibility: visible !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0.5in !important;
              background: white !important;
              page-break-inside: avoid !important;
            }
            .print-card-front {
              page-break-after: always !important;
            }
            .print-card-back {
              page-break-before: always !important;
            }
            .no-print,
            .no-print * {
              display: none !important;
              visibility: hidden !important;
            }
          }
        `}} />
        
        {/* Front of Card */}
        <div ref={printFrontRef} className="print-card-front flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-full w-full text-center border-4 border-amber-300">
            {settings.company_logo_url && (
              <img src={settings.company_logo_url} alt={settings.company_name} className="w-24 h-24 mx-auto mb-4 object-contain" />
            )}
            <h1 className="text-3xl font-bold text-amber-900 mb-2">{settings.company_name}</h1>
            <p className="text-lg text-amber-700 mb-1 font-semibold">{settings.company_theme}</p>
            <p className="text-xs text-gray-600 mb-4">{settings.company_tagline}</p>
            <div className="border-t border-amber-200 pt-4">
              <p className="text-gray-700 text-base">{settings.location_city}, {settings.location_state}</p>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div ref={printBackRef} className="print-card-back flex flex-col items-center justify-center bg-white">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-full w-full text-center border-4 border-amber-300">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Scan for Contact Info</h2>
            <div className="flex justify-center mb-4">
              {getQRCodeValue() && (
                <QRCodeSVG
                  value={getQRCodeValue()}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="text-xs text-gray-600 font-medium">Scan with your phone camera</p>
            <p className="text-xs text-gray-500 mt-1">JTD eBiz Card™</p>
          </div>
        </div>
      </div>
    </div>
  )
}

