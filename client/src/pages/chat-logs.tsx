import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChatLog {
  id: number;
  tripId: number;
  agent: string;
  messageType: "user" | "agent";
  message: string;
  timestamp: string;
  metadata?: {
    step?: string;
    specialty?: string;
    personality?: string;
  };
}

interface Trip {
  id: number;
  destination: string;
  duration: string;
  travelType: string;
  budget: string;
  departureDate: string;
  returnDate: string;
  createdAt: string;
}

interface Deal {
  id: number;
  tripId: number;
  agent: string;
  destination: string;
  price: string;
  originalPrice: string;
  hotelRating: number;
  confirmationTime: string;
  inclusions: string[];
  description: string;
  flightDetails?: any;
  accommodationDetails?: any;
  inclusionsBreakdown?: any;
  locationInfo?: any;
  bookingTerms?: any;
}

export default function ChatLogsPage() {
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Fetch all trips
  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/trips');
      return response.json();
    }
  });

  // Fetch all deals
  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/deals');
      return response.json();
    }
  });

  // Fetch chat logs for selected trip
  const { data: chatLogs = [], isLoading: chatLogsLoading } = useQuery<ChatLog[]>({
    queryKey: [`/api/chat-logs/trip/${selectedTripId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/chat-logs/trip/${selectedTripId}`);
      return response.json();
    },
    enabled: !!selectedTripId
  });

  // Auto-select the most recent trip
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      const mostRecentTrip = trips.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setSelectedTripId(mostRecentTrip.id);
    }
  }, [trips, selectedTripId]);

  const agents = ["TravelBot Pro", "VoyageAI", "JourneyGenie", "WanderBot", "ExploreAI"];

  const getAgentColor = (agent: string) => {
    const colors = {
      "TravelBot Pro": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "VoyageAI": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "JourneyGenie": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "WanderBot": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "ExploreAI": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "User": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[agent as keyof typeof colors] || colors["User"];
  };

  const getAgentIcon = (agent: string) => {
    const icons = {
      "TravelBot Pro": "👑",
      "VoyageAI": "🏛️",
      "JourneyGenie": "🏔️",
      "WanderBot": "💰",
      "ExploreAI": "✨",
      "User": "👤"
    };
    return icons[agent as keyof typeof icons] || "🤖";
  };

  const filteredLogs = selectedAgent
    ? chatLogs?.filter(log => log.agent === selectedAgent || log.agent === "User")
    : chatLogs;

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);
  const tripDeals = deals.filter(deal => deal.tripId === selectedTripId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agent Conversations</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Real-time negotiations and deal analysis
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.close()}
              className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Trip Selection */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-suitcase text-blue-600 dark:text-blue-400"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Selection</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose a trip to view AI agent conversations</p>
            </div>
          </div>

          <Select
            value={selectedTripId?.toString() || ""}
            onValueChange={(value) => setSelectedTripId(parseInt(value))}
          >
            <SelectTrigger className="w-full h-12 border-gray-300 dark:border-gray-600 rounded-lg">
              <SelectValue placeholder="Select a trip to view chat logs" />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id.toString()}>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{trip.destination}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {trip.duration} • {trip.budget} • {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTrip && (
          <div className="space-y-6">
            {/* Modern Tab Navigation */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
              <Tabs defaultValue="conversations" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <TabsTrigger
                    value="conversations"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                  >
                    <i className="fas fa-comments text-blue-500"></i>
                    <span className="hidden sm:inline">Agent Conversations</span>
                    <span className="sm:hidden">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="trip-details"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                  >
                    <i className="fas fa-info-circle text-green-500"></i>
                    <span className="hidden sm:inline">Trip Details</span>
                    <span className="sm:hidden">Details</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="deals"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                  >
                    <i className="fas fa-handshake text-purple-500"></i>
                    <span className="hidden sm:inline">Generated Deals</span>
                    <span className="sm:hidden">Deals</span>
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="conversations" className="mt-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <i className="fas fa-comments text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Agent Negotiations for {selectedTrip.destination}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Real-time conversations with AI travel agents
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Filter Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        !selectedAgent
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      All Agents
                    </button>
                    {agents.map(agent => (
                      <button
                        key={agent}
                        onClick={() => setSelectedAgent(agent)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedAgent === agent
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <span>{getAgentIcon(agent)}</span>
                        <span className="hidden sm:inline">{agent}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="p-6">
                  <div className="h-96 overflow-y-auto pr-4 space-y-4">
                    {chatLogsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">Loading conversations...</span>
                      </div>
                    ) : filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`flex gap-3 ${
                            log.messageType === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {log.messageType === "agent" && (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getAgentColor(log.agent)}`}>
                                {getAgentIcon(log.agent)}
                              </div>
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl p-4 ${
                              log.messageType === "user"
                                ? "bg-blue-500 text-white ml-auto"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {log.messageType === "agent" && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {log.agent}
                                </span>
                                {log.metadata?.specialty && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                    {log.metadata.specialty}
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-sm leading-relaxed">{log.message}</p>

                            <div className="flex items-center justify-between mt-3 text-xs">
                              <span className={log.messageType === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}>
                                {new Date(log.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {log.metadata?.step && (
                                <span className={`text-xs ${log.messageType === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                                  {log.metadata.step.replace(/_/g, ' ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {log.messageType === "user" && (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                👤
                              </div>
                            </div>
                          )}
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-comment-slash text-2xl text-gray-400"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Conversations Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">Chat logs will appear here after agents process your request.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trip-details" className="mt-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <i className="fas fa-info-circle text-green-600 dark:text-green-400"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Request Details</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete information about your travel request</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-map-marker-alt text-red-500"></i>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Destination</label>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTrip.destination}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-clock text-blue-500"></i>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                      </div>
                      <p className="text-lg text-gray-900 dark:text-white">{selectedTrip.duration}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-plane text-purple-500"></i>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Travel Type</label>
                      </div>
                      <p className="text-lg capitalize text-gray-900 dark:text-white">{selectedTrip.travelType}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-wallet text-green-500"></i>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget</label>
                      </div>
                      <p className="text-lg capitalize text-gray-900 dark:text-white">{selectedTrip.budget}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-calendar-alt text-orange-500"></i>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Departure Date</label>
                      </div>
                      <p className="text-lg text-gray-900 dark:text-white">{selectedTrip.departureDate}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-calendar-check text-teal-500"></i>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Return Date</label>
                      </div>
                      <p className="text-lg text-gray-900 dark:text-white">{selectedTrip.returnDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deals" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tripDeals.length > 0 ? (
                  tripDeals.map((deal) => {
                    const savings = ((parseFloat(deal.originalPrice) - parseFloat(deal.price)) / parseFloat(deal.originalPrice) * 100).toFixed(0);
                    return (
                      <div key={deal.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                        {/* Deal Header with Image */}
                        <div className="relative h-48">
                          <img
                            src={deal.imageUrl}
                            alt={deal.destination}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAgentColor(deal.agent)} text-white`}>
                              {getAgentIcon(deal.agent)} {deal.agent}
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Save {savings}%
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-bold">{deal.destination}</h3>
                            <p className="text-sm opacity-90">{deal.description}</p>
                          </div>
                        </div>

                        {/* Deal Content */}
                        <div className="p-6">
                          {/* Price Section */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{deal.price}</div>
                              <div className="text-sm text-gray-500 line-through">₹{deal.originalPrice}</div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fas fa-star text-xs ${
                                      i < deal.hotelRating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-xs text-gray-500">{deal.hotelRating} stars</div>
                            </div>
                          </div>

                          {/* Confirmation Time */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <i className="fas fa-clock text-green-600 dark:text-green-400 text-xs"></i>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Confirmed in {deal.confirmationTime}
                            </span>
                          </div>

                          {/* Inclusions */}
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">What's Included</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {deal.inclusions.slice(0, 6).map((inclusion, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <i className="fas fa-check text-green-500 text-xs"></i>
                                  <span className="text-gray-600 dark:text-gray-400">{inclusion}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-6">
                            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                              <i className="fas fa-eye mr-2"></i>View Details
                            </button>
                            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                              <i className="fas fa-credit-card mr-2"></i>Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-handshake text-2xl text-purple-600 dark:text-purple-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Deals Generated Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">AI agents are still working on finding the best deals for this trip.</p>
                  </div>
                )}
              </div>
            </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {trips.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-suitcase text-3xl text-blue-600 dark:text-blue-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Trips Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start planning your next adventure to see AI agent conversations and deal negotiations in action.
            </p>
            <button
              onClick={() => window.open('/', '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <i className="fas fa-plus"></i>
              Plan Your First Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
