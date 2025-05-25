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
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
});

type TripFormData = z.infer<typeof tripSchema>;

export default function TripForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
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
      email: "",
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

      const emailAddress = form.getValues('email');
      toast({
        title: "🎉 Trip Planned Successfully!",
        description: `We analyzed 5 options and selected the 3 best deals for you! Check your email at ${emailAddress} for the complete details.`,
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
    setLoadingStep(0);

    // Simulate AI processing steps
    const steps = [
      "Contacting 5 AI travel agents...",
      "Analyzing deals from TravelBot Pro...",
      "Analyzing deals from VoyageAI...",
      "Analyzing deals from JourneyGenie...",
      "Analyzing deals from WanderBot...",
      "Analyzing deals from ExploreAI...",
      "Selecting top 3 best deals...",
      "Finalizing your recommendations..."
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(currentStep);
      }
    }, 400);

    // Complete the process
    setTimeout(() => {
      clearInterval(stepInterval);
      createTripMutation.mutate(data);
      setIsLoading(false);
      setLoadingStep(0);
    }, 3200);
  };

  return (
    <section id="trip-form" className="py-20 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tell Us About Your Dream Trip
          </h2>
          <p className="text-lg text-muted-foreground">Our AI will create the perfect itinerary just for you</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-8 md:p-12">
          {!isLoading ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-map-marker-alt text-foreground mr-2"></i>Destination
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Where would you like to go?"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-foreground focus:outline-none transition-all duration-300 bg-background text-foreground"
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
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-calendar text-foreground mr-2"></i>Duration
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-foreground bg-background text-foreground">
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
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-heart text-foreground mr-2"></i>Travel Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-foreground bg-background text-foreground">
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
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-rupee-sign text-foreground mr-2"></i>Budget Range
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-foreground bg-background text-foreground">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">Budget (₹40,000-₹1,20,000)</SelectItem>
                            <SelectItem value="mid-range">Mid-range (₹1,20,000-₹2,80,000)</SelectItem>
                            <SelectItem value="luxury">Luxury (₹2,80,000+)</SelectItem>
                            <SelectItem value="ultra-luxury">Ultra Luxury (₹8,00,000+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email field - full width */}
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="form-group">
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-envelope text-green-500 mr-2"></i>Gmail Address
                          <span className="text-green-600 text-xs ml-2">(Deals will be sent here automatically)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your Gmail address to receive deals"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300 bg-background text-foreground"
                            {...field}
                          />
                        </FormControl>
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
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-calendar-alt text-foreground mr-2"></i>Departure Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-foreground focus:outline-none transition-all duration-300 bg-background text-foreground"
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
                        <FormLabel className="block text-sm font-semibold text-foreground mb-2">
                          <i className="fas fa-calendar-check text-foreground mr-2"></i>Return Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-foreground focus:outline-none transition-all duration-300 bg-background text-foreground"
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
                    className="glow-button bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
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
              <h3 className="text-2xl font-semibold text-foreground mb-4">AI is Planning Your Perfect Trip...</h3>
              <div className="space-y-4">
                <div className="text-lg text-muted-foreground">
                  {loadingStep === 0 && "Contacting 5 AI travel agents..."}
                  {loadingStep === 1 && "Analyzing deals from TravelBot Pro..."}
                  {loadingStep === 2 && "Analyzing deals from VoyageAI..."}
                  {loadingStep === 3 && "Analyzing deals from JourneyGenie..."}
                  {loadingStep === 4 && "Analyzing deals from WanderBot..."}
                  {loadingStep === 5 && "Analyzing deals from ExploreAI..."}
                  {loadingStep === 6 && "Selecting top 3 best deals..."}
                  {loadingStep === 7 && "Finalizing your recommendations..."}
                </div>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step <= loadingStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  We're comparing 5 options to bring you the 3 best deals
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
