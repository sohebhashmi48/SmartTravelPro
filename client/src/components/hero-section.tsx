import { useEffect, useRef } from "react";
import { initializeParallax } from "@/lib/gsap-utils";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      initializeParallax(heroRef.current);
    }
  }, []);

  const scrollToForm = () => {
    const formSection = document.getElementById('trip-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className="parallax-container h-screen relative overflow-hidden">
      {/* Background layers for parallax effect */}
      <div className="parallax-layer absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80')"
          }}
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="parallax-layer bg-gradient-to-r from-background/90 via-background/80 to-background/90" />
      
      {/* Cherry blossoms animation */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="https://media.giphy.com/media/dyjrpqaUVqCELGuQVr/giphy.gif" 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30 mix-blend-screen"
          alt="Cherry blossoms"
        />
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 floating-element opacity-20">
        <i className="fas fa-paper-plane text-white text-4xl"></i>
      </div>
      <div className="absolute top-40 right-20 floating-element opacity-30" style={{ animationDelay: '-2s' }}>
        <i className="fas fa-globe text-secondary text-3xl"></i>
      </div>
      <div className="absolute bottom-40 left-20 floating-element opacity-25" style={{ animationDelay: '-4s' }}>
        <i className="fas fa-compass text-white text-3xl"></i>
      </div>
      
      {/* Hero content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
            Plan Your <span className="gradient-text">Dream Trip</span> with AI
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light animate-fade-in">
            Experience the future of travel planning with our intelligent voice-powered assistant
          </p>
          <button 
            onClick={scrollToForm}
            className="glow-button bg-primary hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
          >
            <i className="fas fa-magic mr-2"></i>
            Start Planning Now
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-white text-2xl"></i>
      </div>
    </section>
  );
}
