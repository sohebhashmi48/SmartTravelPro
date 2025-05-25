import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DealCard from "./deal-card";
import { animateDeals } from "@/lib/gsap-utils";
import type { Deal } from "@shared/schema";

export default function DealsSection() {
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    enabled: false, // Only fetch when triggered by form submission
  });

  useEffect(() => {
    if (deals.length > 0) {
      animateDeals();
    }
  }, [deals]);

  return (
    <section id="deals" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-accent mb-4">
            Top 3 AI-Curated Deals
          </h2>
          <p className="text-lg text-gray-600">Handpicked by our intelligent travel agents</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="deal-card h-96 bg-white rounded-xl shadow-xl">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : deals.length > 0 ? (
            deals.slice(0, 3).map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <i className="fas fa-plane text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Deals Yet</h3>
              <p className="text-gray-500">Submit the trip form above to get AI-curated travel deals</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
