import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DealCard from "./deal-card";
import EnhancedDealCard from "./enhanced-deal-card";
import ChatLogs from "./chat-logs";
import { animateDeals } from "@/lib/gsap-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Deal } from "@shared/schema";

export default function DealsSection() {
  const [viewMode, setViewMode] = useState<"simple" | "detailed">("simple");
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    enabled: false, // Only fetch when triggered by form submission
  });

  // Extract trip ID from the first deal (all deals should have the same trip ID)
  useEffect(() => {
    if (deals.length > 0 && deals[0].tripId) {
      setCurrentTripId(deals[0].tripId);
    }
  }, [deals]);

  useEffect(() => {
    if (deals.length > 0) {
      animateDeals();
    }
  }, [deals]);

  // Mutation for saving deals
  const saveDealMutation = useMutation({
    mutationFn: async (dealId: number) => {
      const response = await apiRequest('POST', `/api/deals/${dealId}/save`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deal Saved!",
        description: "This deal has been added to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for emailing deals
  const emailDealMutation = useMutation({
    mutationFn: async ({ dealId, email }: { dealId: number; email: string }) => {
      const response = await apiRequest('POST', `/api/deals/${dealId}/email`, { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent!",
        description: "Deal details have been sent to your email.",
      });
    },
    onError: () => {
      toast({
        title: "Email Failed",
        description: "Unable to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for booking deals
  const bookDealMutation = useMutation({
    mutationFn: async (dealId: number) => {
      const response = await apiRequest('POST', `/api/deals/${dealId}/book`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Initiated!",
        description: `Your booking ID is ${data.bookingId}. You'll receive confirmation shortly.`,
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to process booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for emailing all deals
  const emailAllDealsMutation = useMutation({
    mutationFn: async ({ tripId, email }: { tripId: number; email: string }) => {
      const response = await apiRequest('POST', `/api/trips/${tripId}/email-deals`, { email });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 All Deals Sent!",
        description: `Top ${data.dealsCount} deals have been sent to ${emailAddress}`,
      });
      setEmailAddress("");
      setShowEmailForm(false);
    },
    onError: () => {
      toast({
        title: "Email Failed",
        description: "Unable to send deals. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (dealId: number) => {
    saveDealMutation.mutate(dealId);
  };

  const handleEmail = (dealId: number, email: string) => {
    emailDealMutation.mutate({ dealId, email });
  };

  const handleBook = (dealId: number) => {
    bookDealMutation.mutate(dealId);
  };

  const handleEmailAllDeals = () => {
    if (currentTripId && emailAddress) {
      emailAllDealsMutation.mutate({ tripId: currentTripId, email: emailAddress });
    }
  };

  return (
    <section id="deals" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Top 3 AI-Curated Deals
          </h2>
          <p className="text-lg text-muted-foreground">
            Selected from 5 options after negotiating with our AI travel agents
          </p>
        </div>

        {deals.length > 0 && (
          <Tabs defaultValue="deals" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="deals" className="flex items-center gap-2">
                <i className="fas fa-suitcase"></i>
                Travel Deals
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <i className="fas fa-comments"></i>
                Agent Conversations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === "simple" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("simple")}
                    className="rounded-md"
                  >
                    <i className="fas fa-th-large mr-2"></i>
                    Simple View
                  </Button>
                  <Button
                    variant={viewMode === "detailed" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("detailed")}
                    className="rounded-md"
                  >
                    <i className="fas fa-list-alt mr-2"></i>
                    Detailed View
                  </Button>
                </div>

                {/* Email All Deals Section */}
                {deals.length > 0 && (
                  <Card className="w-full sm:w-auto">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <i className="fas fa-envelope text-primary"></i>
                        Email All 3 Deals to Gmail
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {!showEmailForm ? (
                        <Button
                          onClick={() => setShowEmailForm(true)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
                        >
                          <i className="fas fa-paper-plane mr-2"></i>
                          Get Deals in Gmail
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="Enter your Gmail address"
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleEmailAllDeals}
                              disabled={!emailAddress || emailAllDealsMutation.isPending}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              {emailAllDealsMutation.isPending ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-send"></i>
                              )}
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowEmailForm(false);
                              setEmailAddress("");
                            }}
                            className="w-full text-muted-foreground"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {isLoading ? (
                <div className={viewMode === "simple" ? "grid grid-cols-1 md:grid-cols-3 gap-8" : "space-y-8"}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="deal-card h-96 bg-card rounded-xl shadow-xl border border-border">
                      <div className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-xl"></div>
                        <div className="p-6 space-y-4">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                          <div className="h-8 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : deals.length > 0 ? (
                <div className={viewMode === "simple" ? "grid grid-cols-1 md:grid-cols-3 gap-8" : "space-y-8"}>
                  {deals.slice(0, 3).map((deal, index) => (
                    viewMode === "simple" ? (
                      <DealCard key={deal.id} deal={deal} index={index} />
                    ) : (
                      <EnhancedDealCard
                        key={deal.id}
                        deal={deal}
                        onSave={handleSave}
                        onEmail={handleEmail}
                        onBook={handleBook}
                      />
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-plane text-6xl text-muted-foreground mb-4"></i>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">No Deals Yet</h3>
                  <p className="text-muted-foreground">Submit the trip form above to get AI-curated travel deals</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="conversations">
              {currentTripId ? (
                <ChatLogs tripId={currentTripId} />
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-comment-slash text-6xl text-muted-foreground mb-4"></i>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">No Conversations Yet</h3>
                  <p className="text-muted-foreground">Agent conversations will appear here after processing your trip request</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {deals.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <i className="fas fa-plane text-6xl text-muted-foreground mb-4"></i>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No Deals Yet</h3>
            <p className="text-muted-foreground">Submit the trip form above to get AI-curated travel deals</p>
          </div>
        )}
      </div>
    </section>
  );
}
