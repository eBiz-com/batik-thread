'use client'

export default function DebugPage() {
  if (typeof window === 'undefined') {
    return <div>Server Side</div>
  }
  
  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h1>Debug Page</h1>
      <p>React is working!</p>
      <p>Window is available: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
      <button onClick={() => alert('Click works!')}>Test Button</button>
    </div>
  )
}

