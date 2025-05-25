import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export default function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Add useEffect to handle video loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded) {
        console.log('Video loading timeout, showing fallback');
        setVideoError(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [videoLoaded]);

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
    <section className="min-h-screen relative flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Debug indicator - remove in production */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded text-sm">
      
      </div>
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        poster="/herovids/paris-drone-aerials.mp4"
        onLoadedData={() => {
          console.log('✅ Video loaded successfully');
          setVideoLoaded(true);
        }}
        onError={(e) => {
          console.error('❌ Video failed to load:', e);
          const video = e.target as HTMLVideoElement;
          if (video.error) {
            console.error('Video error code:', video.error.code);
            console.error('Video error message:', video.error.message);
          }
          setVideoError(true);
        }}
        onCanPlay={() => {
          console.log('✅ Video can play');
          setVideoLoaded(true);
        }}
        onLoadStart={() => {
          console.log('🔄 Video loading started');
        }}
        onProgress={() => {
          console.log('📊 Video loading progress');
        }}
        style={{ display: videoError ? 'none' : 'block' }}
      >
        <source src="/herovids/paris-drone-aerials.mp4" type="video/mp4" />
      </video>

      {/* Fallback background image - shows when video fails or is loading */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          videoError && !videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1333')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90 dark:from-black/60 dark:via-black/70 dark:to-black/90" />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-12">
        <h1 className="font-playfair text-6xl md:text-7xl font-bold text-white dark:text-white mb-6">
          Dream<span className="text-gray-300 dark:text-gray-300">Travel</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 dark:text-white/90 mb-8 font-light max-w-2xl mx-auto">
          Experience the future of travel planning with our intelligent AI assistant
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-white/80">
          <div className="flex items-center gap-2">
            <i className="fas fa-robot text-blue-400"></i>
            <span>5 AI Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-envelope text-green-400"></i>
            <span>Gmail Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-comments text-purple-400"></i>
            <span>Live Chat Logs</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-clock text-yellow-400"></i>
            <span>2-Min Response</span>
          </div>
        </div>

        <button
          onClick={scrollToForm}
          className="bg-white hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-100 text-black dark:text-black font-semibold py-4 px-8 rounded-none text-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_4px_0_0_white]"
        >
          Plan Your Journey
        </button>
      </div>

      {/* Reviews Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/20 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <i key={i} className="fas fa-star text-white dark:text-white"></i>
                ))}
              </div>
              <p className="text-white/90 dark:text-white/90 mb-4 italic">&quot;{review.text}&quot;</p>
              <div className="text-white dark:text-white font-semibold">{review.name}</div>
              <div className="text-white/80 dark:text-white/80 text-sm">{review.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}