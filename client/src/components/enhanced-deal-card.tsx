import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Deal {
  id: number;
  agent: string;
  destination: string;
  price: string;
  originalPrice: string;
  hotelRating: number;
  confirmationTime: string;
  inclusions: string[];
  imageUrl: string;
  description: string;
  flightDetails?: {
    outbound: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; date: string };
      arrival: { airport: string; time: string; date: string };
      duration: string;
      layovers: string[];
    };
    return: {
      airline: string;
      flightNumber: string;
      departure: { airport: string; time: string; date: string };
      arrival: { airport: string; time: string; date: string };
      duration: string;
      layovers: string[];
    };
  };
  accommodationDetails?: {
    name: string;
    address: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    amenities: string[];
    rating: number;
    distanceToCenter: string;
  };
  inclusionsBreakdown?: Record<string, string>;
  locationInfo?: {
    area: string;
    district: string;
    nearbyAttractions: string[];
    localTransport: string;
  };
  bookingTerms?: {
    cancellationPolicy: string;
    paymentTerms: string;
    bookingDeadline: string;
    refundPolicy: string;
    changePolicy: string;
    insurance: string;
  };
}

interface EnhancedDealCardProps {
  deal: Deal;
  onSave: (dealId: number) => void;
  onEmail: (dealId: number, email: string) => void;
  onBook: (dealId: number) => void;
}

export default function EnhancedDealCard({ deal, onSave, onEmail, onBook }: EnhancedDealCardProps) {
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const savings = ((parseFloat(deal.originalPrice) - parseFloat(deal.price)) / parseFloat(deal.originalPrice) * 100).toFixed(0);

  const getAgentColor = (agent: string) => {
    const colors = {
      "TravelBot Pro": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "VoyageAI": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "JourneyGenie": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "WanderBot": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "ExploreAI": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
    };
    return colors[agent as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleEmailSubmit = () => {
    if (emailAddress) {
      onEmail(deal.id, emailAddress);
      setEmailAddress("");
      setShowEmailInput(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative">
        <img
          src={deal.imageUrl}
          alt={deal.destination}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className={getAgentColor(deal.agent)}>
            {deal.agent}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="destructive" className="bg-red-500 text-white">
            Save {savings}%
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{deal.destination}</CardTitle>
            <p className="text-muted-foreground mt-1">{deal.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{deal.price}</div>
            <div className="text-sm text-muted-foreground line-through">₹{deal.originalPrice}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`fas fa-star text-sm ${
                  i < deal.hotelRating ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">
              {deal.hotelRating} stars
            </span>
          </div>
          <Badge variant="outline">
            <i className="fas fa-clock mr-1"></i>
            {deal.confirmationTime}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="hotel">Hotel</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What's Included</h4>
              <div className="grid grid-cols-2 gap-2">
                {deal.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-sm"></i>
                    <span className="text-sm">{inclusion}</span>
                  </div>
                ))}
              </div>
            </div>

            {deal.inclusionsBreakdown && (
              <div>
                <h4 className="font-semibold mb-2">Detailed Inclusions</h4>
                <div className="space-y-2">
                  {Object.entries(deal.inclusionsBreakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="flights" className="space-y-4">
            {deal.flightDetails ? (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-plane-departure text-primary"></i>
                    Outbound Flight
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{deal.flightDetails.outbound.airline}</span>
                      <Badge variant="outline">{deal.flightDetails.outbound.flightNumber}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">{deal.flightDetails.outbound.departure.airport}</div>
                        <div className="text-muted-foreground">{deal.flightDetails.outbound.departure.time}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">{deal.flightDetails.outbound.duration}</div>
                        <i className="fas fa-arrow-right text-primary"></i>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{deal.flightDetails.outbound.arrival.airport}</div>
                        <div className="text-muted-foreground">{deal.flightDetails.outbound.arrival.time}</div>
                      </div>
                    </div>
                    {deal.flightDetails.outbound.layovers.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <i className="fas fa-exchange-alt mr-1"></i>
                        Layovers: {deal.flightDetails.outbound.layovers.join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-plane-arrival text-primary"></i>
                    Return Flight
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{deal.flightDetails.return.airline}</span>
                      <Badge variant="outline">{deal.flightDetails.return.flightNumber}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">{deal.flightDetails.return.departure.airport}</div>
                        <div className="text-muted-foreground">{deal.flightDetails.return.departure.time}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">{deal.flightDetails.return.duration}</div>
                        <i className="fas fa-arrow-right text-primary"></i>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{deal.flightDetails.return.arrival.airport}</div>
                        <div className="text-muted-foreground">{deal.flightDetails.return.arrival.time}</div>
                      </div>
                    </div>
                    {deal.flightDetails.return.layovers.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <i className="fas fa-exchange-alt mr-1"></i>
                        Layovers: {deal.flightDetails.return.layovers.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-plane text-4xl mb-4 opacity-50"></i>
                <p>Flight details will be provided upon booking</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotel" className="space-y-4">
            {deal.accommodationDetails ? (
              <>
                <div>
                  <h4 className="font-semibold text-lg">{deal.accommodationDetails.name}</h4>
                  <p className="text-muted-foreground">{deal.accommodationDetails.address}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star text-sm ${
                            i < deal.accommodationDetails!.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {deal.accommodationDetails.distanceToCenter}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Room Details</h5>
                    <p className="text-sm text-muted-foreground">{deal.accommodationDetails.roomType}</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Check-in/out</h5>
                    <p className="text-sm text-muted-foreground">
                      Check-in: {deal.accommodationDetails.checkIn}<br />
                      Check-out: {deal.accommodationDetails.checkOut}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Hotel Amenities</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {deal.accommodationDetails.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <i className="fas fa-check text-green-500 text-sm"></i>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-hotel text-4xl mb-4 opacity-50"></i>
                <p>Hotel details will be provided upon booking</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            {deal.locationInfo ? (
              <>
                <div>
                  <h4 className="font-semibold mb-2">Location Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Area:</span>
                      <span className="text-muted-foreground">{deal.locationInfo.area}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">District:</span>
                      <span className="text-muted-foreground">{deal.locationInfo.district}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Transport:</span>
                      <span className="text-muted-foreground">{deal.locationInfo.localTransport}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium mb-2">Nearby Attractions</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {deal.locationInfo.nearbyAttractions.map((attraction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                        <span className="text-sm">{attraction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-map text-4xl mb-4 opacity-50"></i>
                <p>Location details will be provided upon booking</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            {deal.bookingTerms ? (
              <div className="space-y-4">
                {Object.entries(deal.bookingTerms).map(([key, value]) => (
                  <div key={key}>
                    <h5 className="font-medium mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </h5>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-file-contract text-4xl mb-4 opacity-50"></i>
                <p>Booking terms will be provided upon booking</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onSave(deal.id)}
            className="flex-1"
          >
            <i className="fas fa-heart mr-2"></i>
            Save
          </Button>

          {!showEmailInput ? (
            <Button
              variant="outline"
              onClick={() => setShowEmailInput(true)}
              className="flex-1"
            >
              <i className="fas fa-envelope mr-2"></i>
              Email
            </Button>
          ) : (
            <div className="flex-1 flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button size="sm" onClick={handleEmailSubmit}>
                Send
              </Button>
            </div>
          )}

          <Button
            onClick={() => onBook(deal.id)}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <i className="fas fa-credit-card mr-2"></i>
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
