import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const scrollToForm = () => {
    const formSection = document.getElementById('trip-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const reviews = [
    {
      name: "Sarah Johnson",
      title: "Adventure Seeker",
      text: "This AI travel planner made organizing my dream vacation a breeze! Highly recommended!",
      rating: 5
    },
    {
      name: "Michael Chen",
      title: "Business Traveler",
      text: "Saved me hours of research. The AI suggestions were spot-on!",
      rating: 5
    },
    {
      name: "Emma Davis",
      title: "Family Vacationer",
      text: "Perfect for planning family trips. The AI understood exactly what we needed.",
      rating: 5
    }
  ];

  return (
    <section className="min-h-screen relative flex flex-col items-center justify-center bg-black dark:bg-slate-900 overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => {
          console.log('Video loaded successfully');
          setVideoLoaded(true);
        }}
        onError={(e) => {
          console.error('Video failed to load:', e);
          setVideoError(true);
        }}
        onCanPlay={() => {
          console.log('Video can play');
        }}
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
      </video>
      
      {/* Fallback background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1333')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-12">
        <h1 className="font-playfair text-6xl md:text-7xl font-bold text-primary dark:text-primary mb-6">
          Dream<span className="text-secondary dark:text-secondary">Travel</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-200 dark:text-slate-300 mb-12 font-light max-w-2xl mx-auto">
          Experience the future of travel planning with our intelligent AI assistant
        </p>
        <button 
          onClick={scrollToForm}
          className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 text-white dark:text-white font-semibold py-4 px-8 rounded-none text-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_4px_0_0_hsl(var(--primary))]"
        >
          Plan Your Journey
        </button>
      </div>

      {/* Reviews Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-black/50 backdrop-blur-sm border border-orange-500/20 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <i key={i} className="fas fa-star text-amber-400"></i>
                ))}
              </div>
              <p className="text-amber-100/90 mb-4 italic">&quot;{review.text}&quot;</p>
              <div className="text-orange-500 font-semibold">{review.name}</div>
              <div className="text-amber-400/80 text-sm">{review.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}