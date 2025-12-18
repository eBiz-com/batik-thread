'use client'

export default function SimplePage() {
  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#d4af37' }}>Simple Client Component Test</h1>
      <p>This is a client component (uses 'use client').</p>
      <p>If you see this, React is working!</p>
      <button 
        onClick={() => alert('Button works!')}
        style={{ padding: '10px 20px', marginTop: '20px', background: '#d4af37', color: '#000', border: 'none', cursor: 'pointer' }}
      >
        Click Me
      </button>
    </div>
  )
}

