import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const tripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.string().min(1, "Duration is required"),
  travelType: z.string().min(1, "Travel type is required"),
  budget: z.string().min(1, "Budget is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().min(1, "Return date is required"),
});

type TripFormData = z.infer<typeof tripSchema>;

export default function TripForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      destination: "",
      duration: "",
      travelType: "",
      budget: "",
      departureDate: "",
      returnDate: "",
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const response = await apiRequest('POST', '/api/trips', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      toast({
        title: "Trip Planned Successfully!",
        description: "Your AI-curated deals are ready below.",
      });
      
      // Scroll to deals section
      setTimeout(() => {
        const dealsSection = document.getElementById('deals');
        if (dealsSection) {
          dealsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Planning Failed",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TripFormData) => {
    // Validate dates
    const departure = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    const today = new Date();

    if (departure < today) {
      toast({
        title: "Invalid Date",
        description: "Departure date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    if (returnDate <= departure) {
      toast({
        title: "Invalid Date",
        description: "Return date must be after departure date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      createTripMutation.mutate(data);
      setIsLoading(false);
    }, 3000);
  };

  return (
    <section id="trip-form" className="py-20 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-accent mb-4">
            Tell Us About Your Dream Trip
          </h2>
          <p className="text-lg text-gray-600">Our AI will create the perfect itinerary just for you</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {!isLoading ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-map-marker-alt text-primary mr-2"></i>Destination
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Where would you like to go?" 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-calendar text-primary mr-2"></i>Duration
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3-5 days">3-5 days</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="1 month">1 month</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="travelType"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-heart text-primary mr-2"></i>Travel Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary">
                              <SelectValue placeholder="Select travel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="honeymoon">Honeymoon</SelectItem>
                            <SelectItem value="solo">Solo Adventure</SelectItem>
                            <SelectItem value="family">Family Vacation</SelectItem>
                            <SelectItem value="business">Business Trip</SelectItem>
                            <SelectItem value="group">Group Travel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-dollar-sign text-primary mr-2"></i>Budget Range
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">Budget ($500-$1,500)</SelectItem>
                            <SelectItem value="mid-range">Mid-range ($1,500-$3,500)</SelectItem>
                            <SelectItem value="luxury">Luxury ($3,500+)</SelectItem>
                            <SelectItem value="ultra-luxury">Ultra Luxury ($10,000+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="departureDate"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-calendar-alt text-primary mr-2"></i>Departure Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-calendar-check text-primary mr-2"></i>Return Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="text-center pt-8">
                  <Button 
                    type="submit" 
                    className="glow-button bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                    disabled={createTripMutation.isPending}
                  >
                    <i className="fas fa-robot mr-2"></i>
                    Get AI Recommendations
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="text-center py-12">
              <div className="shimmer-loading w-32 h-32 rounded-full mx-auto mb-6"></div>
              <h3 className="text-2xl font-semibold text-accent mb-4">AI is Planning Your Perfect Trip...</h3>
              <p className="text-gray-600">Our voice agents are finding the best deals for you</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
