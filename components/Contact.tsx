'use client'

export default function Contact() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello! I would like to learn more about Batik & Thread products.')
    window.open(`https://wa.me/13219616566?text=${message}`, '_blank')
  }

  return (
    <section id="contact" className="py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif text-gold mb-6">Contact Us</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-gray-300">
          <p className="text-lg">
            <strong className="text-gold">Location:</strong> Kissimmee, FL
          </p>
          <p className="text-lg">
            <strong className="text-gold">Phone:</strong>{' '}
            <a href="tel:+13219616566" className="hover:text-gold transition-colors">
              +1 (321) 961-6566
            </a>
          </p>
          <p className="text-lg">
            <strong className="text-gold">WhatsApp:</strong>{' '}
            <button
              onClick={handleWhatsApp}
              className="hover:text-gold transition-colors underline"
            >
              Chat with us
            </button>
          </p>
          <p className="text-gray-400 mt-6">
            Follow us on social media for updates and style inspirations.
          </p>
        </div>
      </div>
    </section>
  )
}

