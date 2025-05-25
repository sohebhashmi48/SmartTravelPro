import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Deal } from "@shared/schema";

interface DealCardProps {
  deal: Deal;
  index: number;
}

export default function DealCard({ deal, index }: DealCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  const saveDealMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/deals/${deal.id}/save`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Deal Saved!",
        description: data.message,
      });
    },
  });

  const emailDealMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/deals/${deal.id}/email`, {
        email: 'user@example.com'
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email Sent!",
        description: data.message,
      });
    },
  });

  const bookDealMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/deals/${deal.id}/book`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Initiated!",
        description: `${data.message} - Booking ID: ${data.bookingId}`,
      });
    },
  });

  const savings = parseFloat(deal.originalPrice.toString()) - parseFloat(deal.price.toString());

  return (
    <div 
      className="deal-card flip-card h-96 cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="flip-card-front bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="relative h-48">
            <img 
              src={deal.imageUrl} 
              alt={deal.destination} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              Save ${savings.toFixed(0)}
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {deal.agent}
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-xl text-accent mb-2">{deal.destination}</h3>
            <div className="flex items-center mb-2">
              {Array.from({ length: deal.hotelRating }).map((_, i) => (
                <i key={i} className="fas fa-star text-yellow-400"></i>
              ))}
              <span className="ml-2 text-gray-600">{deal.hotelRating} Stars</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-primary">${deal.price}</span>
                <span className="text-gray-500 line-through ml-2">${deal.originalPrice}</span>
              </div>
              <div className="text-green-600 font-semibold">
                <i className="fas fa-clock mr-1"></i>{deal.confirmationTime}
              </div>
            </div>
          </div>
        </div>
        
        {/* Back of card */}
        <div className="flip-card-back bg-gradient-to-br from-primary to-blue-600 text-white p-6 flex flex-col justify-between rounded-xl">
          <div>
            <h3 className="font-bold text-xl mb-4">{deal.destination}</h3>
            <p className="text-sm opacity-90 mb-4">{deal.description}</p>
            <div className="space-y-2">
              <h4 className="font-semibold">Inclusions:</h4>
              {deal.inclusions.map((item, i) => (
                <div key={i} className="flex items-center text-sm">
                  <i className="fas fa-check mr-2"></i>{item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Button 
              onClick={() => saveDealMutation.mutate()}
              disabled={saveDealMutation.isPending}
              className="w-full bg-white text-primary font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-heart mr-2"></i>Save Deal
            </Button>
            <Button 
              onClick={() => emailDealMutation.mutate()}
              disabled={emailDealMutation.isPending}
              className="w-full bg-secondary text-gray-900 font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <i className="fas fa-envelope mr-2"></i>Email Me
            </Button>
            <Button 
              onClick={() => bookDealMutation.mutate()}
              disabled={bookDealMutation.isPending}
              className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <i className="fas fa-plane mr-2"></i>Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
