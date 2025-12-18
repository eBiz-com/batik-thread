'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())
  }, [])

  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#d4af37' }}>Test Page - It Works!</h1>
      <p>If you can see this, Next.js is working correctly.</p>
      {currentTime && <p>Current time: {currentTime}</p>}
    </div>
  )
}

