import { useEffect } from "react";

export default function HeroSection() {
  const scrollToForm = () => {
    const formSection = document.getElementById('trip-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen relative flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="font-playfair text-6xl md:text-7xl font-bold text-orange-500 mb-6">
          Dream<span className="text-amber-400">Travel</span>
        </h1>
        <p className="text-xl md:text-2xl text-amber-100/80 mb-12 font-light max-w-2xl mx-auto">
          Experience the future of travel planning with our intelligent AI assistant
        </p>
        <button 
          onClick={scrollToForm}
          className="bg-orange-500 hover:bg-orange-600 text-black font-semibold py-4 px-8 rounded-none text-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_4px_0_0_rgb(245,158,11)]"
        >
          Plan Your Journey
        </button>
      </div>
    </section>
  );
}