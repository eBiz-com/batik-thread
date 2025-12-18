import Image from 'next/image'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[60vh] flex items-center justify-center text-center bg-cover bg-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <Image
          src="/hero-fabric.png"
          alt="African Fabric Patterns"
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-serif text-gold-light glimmer mb-4">
          Modern African Luxury
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Bold. Refined. Rooted in Heritage.
        </p>
        <a
          href="#shop"
          className="inline-block bg-gold text-black px-8 py-3 rounded-full font-semibold hover:bg-gold-light hover:scale-105 transition-all"
        >
          Shop Now
        </a>
      </div>
    </section>
  )
}

