// Store settings in localStorage (can be moved to Supabase later)
export interface StoreSettings {
  taxPercentage: number
  shippingHandling: number
}

const DEFAULT_SETTINGS: StoreSettings = {
  taxPercentage: 7.5, // 7.5% default tax
  shippingHandling: 10.00, // $10 default shipping
}

export const getSettings = (): StoreSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  const stored = localStorage.getItem('store_settings')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return DEFAULT_SETTINGS
    }
  }
  return DEFAULT_SETTINGS
}

export const saveSettings = (settings: StoreSettings): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('store_settings', JSON.stringify(settings))
}

export const calculateOrderTotal = (subtotal: number, settings: StoreSettings) => {
  const tax = (subtotal * settings.taxPercentage) / 100
  const shipping = settings.shippingHandling
  const total = subtotal + tax + shipping
  
  return {
    subtotal,
    tax,
    shipping,
    total,
  }
}

