import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTripSchema, insertDealSchema, insertAgentLogSchema } from "@shared/schema";
import { z } from "zod";
import { emailService } from "./email-service";

// OmniDimension API integration
async function callOmniDimensionAPI(tripData: any) {
  const apiKey = process.env.OMNIDIMENSION_API_KEY;
  const endpoint = process.env.OMNIDIMENSION_ENDPOINT;

  if (!apiKey || !endpoint) {
    console.log("OmniDimension API credentials not found, using mock data");
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: tripData.destination,
        duration: tripData.duration,
        travelType: tripData.travelType,
        budget: tripData.budget,
        departureDate: tripData.departureDate,
        returnDate: tripData.returnDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("OmniDimension API error:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Trip planning endpoint
  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);

      // Simulate OmniDimension API call and generate deals
      const deals = await generateDealsForTrip(trip);

      // Create agent log entry
      await storage.createAgentLog({
        agent: "TravelBot Pro",
        price: deals[0]?.price || "2899.00",
        hotelRating: deals[0]?.hotelRating || 5,
        deliveryTime: "2 min",
        notes: `Trip to ${trip.destination} for ${trip.travelType}`
      });

      // Automatically send deals to the provided email
      if (trip.email && deals.length > 0) {
        console.log(`🚀 Trip created successfully for ${trip.destination}`);
        console.log(`📧 Email provided: ${trip.email}`);
        console.log(`💼 Generated ${deals.length} deals`);

        try {
          console.log(`📤 Attempting to send automatic email...`);
          const success = await emailService.sendDealsEmail(trip.email, deals.slice(0, 3), trip);
          if (success) {
            console.log(`✅ Deals automatically sent to ${trip.email}`);
          } else {
            console.log(`❌ Failed to send deals to ${trip.email}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send automatic email:', emailError);
          // Don't fail the entire request if email fails
        }
      } else {
        console.log(`⚠️ No email provided or no deals generated`);
        console.log(`Email: ${trip.email || 'Not provided'}`);
        console.log(`Deals count: ${deals.length}`);
      }

      res.json({ trip, deals });
    } catch (error) {
      res.status(400).json({ message: "Invalid trip data", error });
    }
  });

  // Get all trips
  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await storage.getAllTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  // Get all deals
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Get agent logs
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getAllAgentLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Export logs to CSV
  app.get("/api/logs/export", async (req, res) => {
    try {
      const logs = await storage.getAllAgentLogs();

      const csvHeader = "Agent,Price,Hotel Rating,Delivery Time,Timestamp,Notes\n";
      const csvData = logs.map(log =>
        `"${log.agent}","${log.price}","${log.hotelRating}","${log.deliveryTime}","${log.createdAt.toLocaleString()}","${log.notes}"`
      ).join("\n");

      const csv = csvHeader + csvData;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="travel-agent-logs.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export logs" });
    }
  });

  // Google Sheets integration endpoint
  app.post("/api/logs/sheets", async (req, res) => {
    try {
      const logs = await storage.getAllAgentLogs();

      // Mock Google Sheets API integration
      // In a real implementation, you would use the Google Sheets API
      const sheetsData = logs.map(log => [
        log.agent,
        log.price.toString(),
        log.hotelRating.toString(),
        log.deliveryTime,
        log.createdAt.toLocaleString(),
        log.notes
      ]);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.json({
        message: "Logs sent to Google Sheets successfully",
        rows: sheetsData.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send logs to Google Sheets" });
    }
  });

  // Agent management endpoints
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const agent = await storage.updateAgent(id, updates);

      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAgentAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Chat logs endpoints
  app.get("/api/chat-logs/trip/:tripId", async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const chatLogs = await storage.getChatLogsByTripId(tripId);
      res.json(chatLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat logs" });
    }
  });

  app.get("/api/chat-logs/agent/:agent", async (req, res) => {
    try {
      const agent = req.params.agent;
      const chatLogs = await storage.getChatLogsByAgent(agent);
      res.json(chatLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent chat logs" });
    }
  });

  // Deal actions
  app.post("/api/deals/:id/save", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      // Mock save functionality
      res.json({ message: `Deal ${dealId} saved to favorites` });
    } catch (error) {
      res.status(500).json({ message: "Failed to save deal" });
    }
  });

  app.post("/api/deals/:id/email", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const { email } = req.body;

      // Get the deal from database
      const deals = await storage.getAllDeals();
      const deal = deals.find(d => d.id === dealId);

      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      // Send email using email service
      const success = await emailService.sendSingleDealEmail(email, deal);

      if (success) {
        res.json({ message: `Deal details sent to ${email}` });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to email deal" });
    }
  });

  // Send best 3 deals to email
  app.post("/api/trips/:tripId/email-deals", async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const { email } = req.body;

      // Get trip details
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      // Get all deals for this trip
      const allDeals = await storage.getDealsByTripId(tripId);

      if (allDeals.length === 0) {
        return res.status(404).json({ message: "No deals found for this trip" });
      }

      // Get the best 3 deals (they should already be sorted by value)
      const bestDeals = allDeals.slice(0, 3);

      // Send email with all 3 deals
      const success = await emailService.sendDealsEmail(email, bestDeals, trip);

      if (success) {
        res.json({
          message: `Top 3 deals sent to ${email}`,
          dealsCount: bestDeals.length
        });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to email deals" });
    }
  });

  app.post("/api/deals/:id/book", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      // Mock booking functionality
      res.json({
        message: `Booking initiated for deal ${dealId}`,
        bookingId: `BK${Date.now()}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to book deal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Function to generate 5 deals from different agents and return top 3 best deals
async function generateDealsForTrip(trip: any) {
  try {
    // Generate 5 deals from different AI travel agents
    const allDeals = await generateFiveDealsFromAgents(trip);

    // Select top 3 best deals based on value (price vs original price ratio and rating)
    const topThreeDeals = selectBestDeals(allDeals, 3);

    // Save the top 3 deals to database
    const createdDeals = [];
    for (const dealData of topThreeDeals) {
      const deal = await storage.createDeal(dealData);
      createdDeals.push(deal);
    }

    return createdDeals;

  } catch (error) {
    console.error('Deal generation error:', error);
    return await generateFallbackDeals(trip);
  }
}

// Generate 5 deals from different AI travel agents with chat logs
async function generateFiveDealsFromAgents(trip: any) {
  const agents = [
    {
      name: "TravelBot Pro",
      specialty: "Luxury",
      responseTime: "2 min",
      priceMultiplier: 1.0,
      ratingBonus: 1,
      personality: "Professional and sophisticated, focuses on premium experiences"
    },
    {
      name: "VoyageAI",
      specialty: "Cultural",
      responseTime: "3 min",
      priceMultiplier: 1.1,
      ratingBonus: 0,
      personality: "Knowledgeable and enthusiastic about local culture and history"
    },
    {
      name: "JourneyGenie",
      specialty: "Adventure",
      responseTime: "1.5 min",
      priceMultiplier: 0.95,
      ratingBonus: 0,
      personality: "Energetic and adventurous, loves outdoor activities and thrills"
    },
    {
      name: "WanderBot",
      specialty: "Budget",
      responseTime: "4 min",
      priceMultiplier: 0.85,
      ratingBonus: -1,
      personality: "Practical and cost-conscious, finds great value deals"
    },
    {
      name: "ExploreAI",
      specialty: "Premium",
      responseTime: "2.5 min",
      priceMultiplier: 1.15,
      ratingBonus: 1,
      personality: "Refined and detail-oriented, curates exclusive experiences"
    }
  ];

  const basePrice = calculateBasePrice(trip.budget, trip.destination);
  const deals = [];

  // Generate chat logs for each agent
  await generateChatLogsForTrip(trip, agents);

  for (const agent of agents) {
    const finalPrice = basePrice * agent.priceMultiplier + Math.random() * 200 - 100;
    const originalPrice = basePrice * agent.priceMultiplier * 1.2 + Math.random() * 300;

    const deal = {
      tripId: trip.id,
      agent: agent.name,
      destination: trip.destination,
      price: finalPrice.toFixed(2),
      originalPrice: originalPrice.toFixed(2),
      hotelRating: Math.min(5, Math.max(1, 4 + agent.ratingBonus + Math.floor(Math.random() * 2))),
      confirmationTime: agent.responseTime,
      inclusions: generateInclusions(agent.specialty, trip.travelType),
      imageUrl: getDestinationImage(trip.destination),
      description: generateDescription(agent.specialty, trip.destination, trip.travelType),
      // Enhanced deal information
      flightDetails: generateFlightDetails(trip.destination, trip.departureDate, trip.returnDate),
      accommodationDetails: generateAccommodationDetails(agent.specialty, trip.destination),
      inclusionsBreakdown: generateInclusionsBreakdown(agent.specialty, trip.travelType),
      locationInfo: generateLocationInfo(trip.destination),
      bookingTerms: generateBookingTerms(agent.specialty)
    };
    deals.push(deal);
  }

  return deals;
}

// Calculate base price based on budget and destination (in INR)
function calculateBasePrice(budget: string, destination: string) {
  const budgetMultipliers: { [key: string]: number } = {
    "budget": 120000,
    "mid-range": 200000,
    "luxury": 320000,
    "ultra-luxury": 480000
  };

  const destinationMultipliers: { [key: string]: number } = {
    "bali": 1.0,
    "paris": 1.3,
    "tokyo": 1.2,
    "new york": 1.4,
    "london": 1.35,
    "dubai": 1.25,
    "maldives": 1.8,
    "switzerland": 1.6
  };

  const baseBudget = budgetMultipliers[budget.toLowerCase()] || 2500;
  const destMultiplier = destinationMultipliers[destination.toLowerCase()] || 1.0;

  return baseBudget * destMultiplier;
}

// Generate inclusions based on agent specialty and travel type
function generateInclusions(specialty: string, travelType: string) {
  const baseInclusions = ["Hotel", "Breakfast"];

  const specialtyInclusions: { [key: string]: string[] } = {
    "Luxury": ["5★ Resort", "All Meals", "Spa Package", "Airport Transfer", "Butler Service"],
    "Cultural": ["4★ Hotel", "Guided Tours", "Museum Passes", "Local Experiences"],
    "Adventure": ["Adventure Lodge", "Activity Equipment", "Expert Guides", "Safety Gear"],
    "Budget": ["3★ Hotel", "Continental Breakfast", "City Map", "Metro Pass"],
    "Premium": ["5★ Hotel", "Fine Dining", "Private Tours", "Concierge Service"]
  };

  const travelInclusions: { [key: string]: string[] } = {
    "business": ["Business Lounge", "Fast WiFi", "Meeting Rooms"],
    "leisure": ["Pool Access", "Entertainment", "Relaxation Areas"],
    "adventure": ["Outdoor Activities", "Equipment Rental", "Adventure Tours"],
    "cultural": ["Cultural Sites", "Local Guides", "Historical Tours"]
  };

  return [
    ...baseInclusions,
    ...(specialtyInclusions[specialty] || []).slice(0, 3),
    ...(travelInclusions[travelType.toLowerCase()] || []).slice(0, 2)
  ].slice(0, 5);
}

// Get destination image URL
function getDestinationImage(destination: string) {
  const imageMap: { [key: string]: string } = {
    "bali": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "paris": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  };

  return imageMap[destination.toLowerCase()] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
}

// Generate description based on specialty and destination
function generateDescription(specialty: string, destination: string, travelType: string) {
  const descriptions: { [key: string]: string } = {
    "Luxury": `Indulge in ultimate luxury with our premium ${destination} experience. Featuring world-class accommodations and exclusive amenities.`,
    "Cultural": `Immerse yourself in the rich culture of ${destination} with authentic local experiences and expert cultural guides.`,
    "Adventure": `Embark on an thrilling adventure in ${destination} with exciting activities and expert adventure guides.`,
    "Budget": `Explore ${destination} without breaking the bank. Great value accommodation with essential amenities included.`,
    "Premium": `Experience ${destination} in style with our premium travel package featuring top-tier services and accommodations.`
  };

  return descriptions[specialty] || `Discover the beauty of ${destination} with our carefully curated travel package.`;
}

// Select best deals based on value score
function selectBestDeals(deals: any[], count: number) {
  // Calculate value score for each deal (lower is better)
  const dealsWithScore = deals.map(deal => {
    const price = parseFloat(deal.price);
    const originalPrice = parseFloat(deal.originalPrice);
    const savings = originalPrice - price;
    const savingsPercentage = (savings / originalPrice) * 100;
    const ratingScore = deal.hotelRating * 20; // Rating out of 100
    const timeScore = parseFloat(deal.confirmationTime) * -5; // Faster is better

    // Value score: higher savings percentage + higher rating + faster time = better deal
    const valueScore = savingsPercentage + ratingScore + timeScore;

    return { ...deal, valueScore, savingsPercentage };
  });

  // Sort by value score (highest first) and return top deals
  return dealsWithScore
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, count);
}

// Fallback deals if generation fails (in INR)
async function generateFallbackDeals(trip: any) {
  const fallbackDeals = [
    {
      tripId: trip.id,
      agent: "TravelBot Pro",
      destination: trip.destination,
      price: "231920.00",
      originalPrice: "279920.00",
      hotelRating: 5,
      confirmationTime: "2 min",
      inclusions: ["5★ Resort", "All Meals", "Spa Package", "Airport Transfer"],
      imageUrl: getDestinationImage(trip.destination),
      description: "Luxury beachfront resort with private villas"
    },
    {
      tripId: trip.id,
      agent: "VoyageAI",
      destination: trip.destination,
      price: "212000.00",
      originalPrice: "256000.00",
      hotelRating: 4,
      confirmationTime: "3 min",
      inclusions: ["4★ Hotel", "Breakfast", "City Tours", "Local Guide"],
      imageUrl: getDestinationImage(trip.destination),
      description: "Cultural immersion with authentic local experiences"
    },
    {
      tripId: trip.id,
      agent: "JourneyGenie",
      destination: trip.destination,
      price: "196000.00",
      originalPrice: "236000.00",
      hotelRating: 4,
      confirmationTime: "1.5 min",
      inclusions: ["4★ Hotel", "Adventure Tours", "Equipment", "Expert Guide"],
      imageUrl: getDestinationImage(trip.destination),
      description: "Adventure-packed journey with thrilling activities"
    }
  ];

  const createdDeals = [];
  for (const dealData of fallbackDeals) {
    const deal = await storage.createDeal(dealData);
    createdDeals.push(deal);
  }

  return createdDeals;
}

// Generate chat logs for trip with all agents
async function generateChatLogsForTrip(trip: any, agents: any[]) {
  const userMessage = `Hi! I'm looking for a ${trip.travelType} trip to ${trip.destination} for ${trip.duration}. My budget is ${trip.budget}. Departure: ${trip.departureDate}, Return: ${trip.returnDate}. Can you help me find the best deal?`;

  // Create initial user message
  await storage.createChatLog({
    tripId: trip.id,
    agent: "User",
    messageType: "user",
    message: userMessage,
    timestamp: new Date(),
    metadata: { step: "initial_request" }
  });

  // Generate agent responses
  for (const agent of agents) {
    await generateAgentConversation(trip, agent);
  }
}

// Generate conversation for a specific agent
async function generateAgentConversation(trip: any, agent: any) {
  const conversations = {
    "TravelBot Pro": [
      `Hello! I'm TravelBot Pro, your luxury travel specialist. I'd be delighted to curate an exquisite ${trip.travelType} experience in ${trip.destination} for you.`,
      `Based on your preferences, I'm sourcing premium accommodations and exclusive experiences. Let me check our luxury partner hotels...`,
      `Excellent! I've found a spectacular 5-star resort with private butler service and spa access. The total package includes first-class flights and VIP transfers.`,
      `I can offer you this luxury package at a special rate. Would you like me to hold this reservation while you consider your options?`
    ],
    "VoyageAI": [
      `Greetings! I'm VoyageAI, and I'm passionate about cultural immersion. ${trip.destination} has such rich history and traditions to explore!`,
      `For your ${trip.travelType} trip, I'm curating authentic local experiences including guided heritage tours and traditional cuisine tastings.`,
      `I've partnered with local cultural centers to provide you with exclusive access to historical sites and traditional workshops.`,
      `This cultural package includes expert local guides and unique experiences you won't find elsewhere. Shall I prepare the detailed itinerary?`
    ],
    "JourneyGenie": [
      `Hey there! JourneyGenie here, ready for an adventure! ${trip.destination} is perfect for some thrilling activities and outdoor exploration!`,
      `I'm putting together an action-packed itinerary with hiking, water sports, and adventure tours. Safety equipment and expert guides included!`,
      `Found some amazing adventure lodges with direct access to outdoor activities. Plus, I've secured group discounts for adventure gear rental.`,
      `This adventure package is going to be epic! All safety certifications included. Ready to book your adrenaline-filled journey?`
    ],
    "WanderBot": [
      `Hi! WanderBot here, your budget-smart travel companion. I'll find you amazing value without compromising on the experience in ${trip.destination}.`,
      `I'm scanning for the best deals on flights and accommodations. Found some great 3-star hotels with excellent reviews and perfect locations.`,
      `Great news! I've negotiated special rates with local partners. This package includes essential amenities and convenient transportation.`,
      `This budget-friendly option gives you excellent value for money. You'll save significantly while still enjoying a wonderful trip!`
    ],
    "ExploreAI": [
      `Welcome! I'm ExploreAI, specializing in premium curated experiences. Let me design something truly special for your ${trip.destination} journey.`,
      `I'm arranging exclusive access to premium venues and private tours. My network includes boutique hotels and renowned local experts.`,
      `Perfect! I've secured a premium package with personalized concierge service and exclusive dining reservations at award-winning restaurants.`,
      `This premium experience includes VIP access and personalized service throughout your stay. Shall I finalize these exclusive arrangements?`
    ]
  };

  const agentMessages = conversations[agent.name] || [
    `Hello! I'm ${agent.name}, and I'd love to help you plan your trip to ${trip.destination}.`,
    `Let me search for the best options for your ${trip.travelType} trip...`,
    `I've found some great deals that match your preferences and budget.`,
    `Would you like me to provide more details about this package?`
  ];

  for (let i = 0; i < agentMessages.length; i++) {
    await storage.createChatLog({
      tripId: trip.id,
      agent: agent.name,
      messageType: "agent",
      message: agentMessages[i],
      timestamp: new Date(Date.now() + i * 30000), // 30 seconds apart
      metadata: {
        step: `response_${i + 1}`,
        specialty: agent.specialty,
        personality: agent.personality
      }
    });
  }
}

// Generate flight details
function generateFlightDetails(destination: string, departureDate: string, returnDate: string) {
  const airlines = ["Emirates", "Singapore Airlines", "Qatar Airways", "Lufthansa", "British Airways"];
  const airline = airlines[Math.floor(Math.random() * airlines.length)];

  return {
    outbound: {
      airline: airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
      departure: {
        airport: "JFK",
        time: "14:30",
        date: departureDate
      },
      arrival: {
        airport: getDestinationAirport(destination),
        time: "18:45",
        date: departureDate
      },
      duration: "8h 15m",
      layovers: Math.random() > 0.5 ? ["Dubai (2h 30m)"] : []
    },
    return: {
      airline: airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
      departure: {
        airport: getDestinationAirport(destination),
        time: "22:15",
        date: returnDate
      },
      arrival: {
        airport: "JFK",
        time: "06:30",
        date: returnDate
      },
      duration: "9h 15m",
      layovers: Math.random() > 0.5 ? ["London (1h 45m)"] : []
    }
  };
}

// Generate accommodation details
function generateAccommodationDetails(specialty: string, destination: string) {
  const hotelNames = {
    "Luxury": [`The Ritz-Carlton ${destination}`, `Four Seasons ${destination}`, `St. Regis ${destination}`],
    "Cultural": [`Heritage Hotel ${destination}`, `Cultural Palace ${destination}`, `Traditional Inn ${destination}`],
    "Adventure": [`Adventure Lodge ${destination}`, `Mountain Resort ${destination}`, `Explorer's Base ${destination}`],
    "Budget": [`Comfort Inn ${destination}`, `City Hotel ${destination}`, `Traveler's Rest ${destination}`],
    "Premium": [`Grand Hotel ${destination}`, `Premium Suites ${destination}`, `Elite Resort ${destination}`]
  };

  const hotels = hotelNames[specialty] || hotelNames["Premium"];
  const hotelName = hotels[Math.floor(Math.random() * hotels.length)];

  return {
    name: hotelName,
    address: `123 Main Street, ${destination} City Center`,
    roomType: specialty === "Luxury" ? "Presidential Suite" : specialty === "Budget" ? "Standard Room" : "Deluxe Room",
    checkIn: "15:00",
    checkOut: "11:00",
    amenities: getHotelAmenities(specialty),
    rating: specialty === "Luxury" ? 5 : specialty === "Budget" ? 3 : 4,
    distanceToCenter: `${Math.floor(Math.random() * 5) + 1}km from city center`
  };
}

// Generate inclusions breakdown
function generateInclusionsBreakdown(specialty: string, travelType: string) {
  const baseInclusions = {
    accommodation: "Hotel stay as specified",
    meals: specialty === "Luxury" ? "All meals included" : "Breakfast included",
    transportation: "Airport transfers included"
  };

  const specialtyInclusions = {
    "Luxury": {
      spa: "Full spa access and treatments",
      concierge: "24/7 concierge service",
      dining: "Fine dining experiences"
    },
    "Cultural": {
      tours: "Guided cultural tours",
      museums: "Museum and heritage site passes",
      experiences: "Traditional cultural experiences"
    },
    "Adventure": {
      equipment: "Adventure equipment rental",
      guides: "Professional adventure guides",
      activities: "Outdoor activity packages"
    },
    "Budget": {
      basics: "Essential amenities",
      transport: "Public transport passes",
      maps: "City maps and guides"
    },
    "Premium": {
      service: "Premium customer service",
      upgrades: "Room and service upgrades",
      exclusive: "Exclusive venue access"
    }
  };

  return {
    ...baseInclusions,
    ...(specialtyInclusions[specialty] || {})
  };
}

// Generate location information
function generateLocationInfo(destination: string) {
  const locationData = {
    "bali": {
      area: "Seminyak Beach Area",
      district: "Badung Regency",
      nearbyAttractions: ["Tanah Lot Temple", "Ubud Rice Terraces", "Mount Batur"],
      localTransport: "Scooter rental, private driver, taxi"
    },
    "paris": {
      area: "Champs-Élysées District",
      district: "8th Arrondissement",
      nearbyAttractions: ["Eiffel Tower", "Louvre Museum", "Arc de Triomphe"],
      localTransport: "Metro, bus, taxi, walking"
    },
    "tokyo": {
      area: "Shibuya District",
      district: "Shibuya City",
      nearbyAttractions: ["Senso-ji Temple", "Tokyo Skytree", "Imperial Palace"],
      localTransport: "JR trains, subway, taxi"
    }
  };

  return locationData[destination.toLowerCase()] || {
    area: `${destination} City Center`,
    district: `Central ${destination}`,
    nearbyAttractions: ["Local landmarks", "Cultural sites", "Shopping areas"],
    localTransport: "Public transport, taxi, walking"
  };
}

// Generate booking terms
function generateBookingTerms(specialty: string) {
  const baseCancellation = specialty === "Budget" ? "48 hours" : "24 hours";
  const refundPolicy = specialty === "Luxury" ? "Full refund" : "Partial refund";

  return {
    cancellationPolicy: `Free cancellation up to ${baseCancellation} before departure`,
    paymentTerms: "50% deposit required, balance due 30 days before travel",
    bookingDeadline: "Book by 7 days before departure",
    refundPolicy: refundPolicy,
    changePolicy: "Changes allowed with 48 hours notice (fees may apply)",
    insurance: "Travel insurance recommended"
  };
}

// Helper functions
function getDestinationAirport(destination: string) {
  const airports = {
    "bali": "DPS",
    "paris": "CDG",
    "tokyo": "NRT",
    "new york": "JFK",
    "london": "LHR"
  };
  return airports[destination.toLowerCase()] || "INT";
}

function getHotelAmenities(specialty: string) {
  const amenities = {
    "Luxury": ["Spa", "Butler service", "Private pool", "Fine dining", "Concierge"],
    "Cultural": ["Cultural center", "Local guides", "Traditional decor", "Heritage tours"],
    "Adventure": ["Equipment rental", "Adventure desk", "Outdoor activities", "Safety gear"],
    "Budget": ["WiFi", "Breakfast", "24h reception", "Luggage storage"],
    "Premium": ["Premium service", "Upgraded amenities", "Exclusive access", "Personal assistant"]
  };
  return amenities[specialty] || amenities["Premium"];
}
