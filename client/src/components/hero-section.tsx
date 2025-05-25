import { useEffect } from "react";

export default function HeroSection() {
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
    <section className="min-h-screen relative flex flex-col items-center justify-center bg-black overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="herovids/Paris： The last drone aerials.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-12">
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