import HeroSection from "@/components/hero-section";
import TripForm from "@/components/trip-form";
import DealsSection from "@/components/deals-section";
import LogsPanel from "@/components/logs-panel";
import AdminPanel from "@/components/admin-panel";
import { useState } from "react";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <i className="fas fa-plane text-primary text-2xl mr-3"></i>
              <span className="font-playfair text-2xl font-bold text-accent">DreamTravel AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#destinations" className="text-gray-700 hover:text-primary transition-colors">Destinations</a>
              <a href="#deals" className="text-gray-700 hover:text-primary transition-colors">Deals</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors">About</a>
              <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <TripForm />
      <DealsSection />
      <LogsPanel />
      
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Footer */}
      <footer className="bg-accent text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-plane text-primary text-2xl mr-3"></i>
                <span className="font-playfair text-2xl font-bold">DreamTravel AI</span>
              </div>
              <p className="text-gray-300">Experience the future of travel planning with AI-powered assistance.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Deals</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  <i className="fab fa-facebook text-2xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  <i className="fab fa-twitter text-2xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  <i className="fab fa-youtube text-2xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 DreamTravel AI. All rights reserved. Powered by OmniDimension Voice Agents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
