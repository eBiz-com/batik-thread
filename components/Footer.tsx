'use client'

import { useState, useEffect } from 'react'

export default function Footer() {
  const [year, setYear] = useState(2024)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-black py-6 text-center border-t border-gold/20">
      <p className="text-gray-400">
        &copy; {year} Batik & Thread — Modern African Luxury
      </p>
    </footer>
  )
}

