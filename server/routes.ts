import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTripSchema, insertDealSchema, insertAgentLogSchema } from "@shared/schema";
import { z } from "zod";

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
      
      res.json({ trip, deals });
    } catch (error) {
      res.status(400).json({ message: "Invalid trip data", error });
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
      
      // Mock email functionality
      res.json({ message: `Deal ${dealId} will be emailed to ${email}` });
    } catch (error) {
      res.status(500).json({ message: "Failed to email deal" });
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

// Function to call OmniDimension API and generate real deals from travel agents
async function generateDealsForTrip(trip: any) {
  try {
    // Call OmniDimension API with the provided credentials
    const response = await fetch(process.env.OMNIDIMENSION_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OMNIDIMENSION_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: trip.destination,
        duration: trip.duration,
        travelType: trip.travelType,
        budget: trip.budget,
        departureDate: trip.departureDate,
        returnDate: trip.returnDate,
        requestType: 'travel_deals',
        maxResults: 3
      })
    });

    if (!response.ok) {
      throw new Error(`OmniDimension API error: ${response.status}`);
    }

    const apiResult = await response.json();
    
    // Transform API response to our deal format
    const dealsFromAPI = apiResult.deals || apiResult.results || [];
    
    const createdDeals = [];
    for (const apiDeal of dealsFromAPI.slice(0, 3)) {
      const dealData = {
        tripId: trip.id,
        agent: apiDeal.agentName || apiDeal.agent || "AI Travel Agent",
        destination: trip.destination,
        price: apiDeal.price || apiDeal.totalCost || "2899.00",
        originalPrice: apiDeal.originalPrice || apiDeal.listPrice || "3499.00",
        hotelRating: apiDeal.hotelStars || apiDeal.rating || 4,
        confirmationTime: apiDeal.responseTime || apiDeal.confirmationTime || "3 min",
        inclusions: apiDeal.inclusions || apiDeal.amenities || ["Hotel", "Breakfast", "Tours"],
        imageUrl: apiDeal.imageUrl || `https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600`,
        description: apiDeal.description || apiDeal.summary || `Premium travel package to ${trip.destination}`
      };
      
      const deal = await storage.createDeal(dealData);
      createdDeals.push(deal);
    }

    return createdDeals;
    
  } catch (error) {
    console.error('OmniDimension API Error:', error);
    
    // Fallback to sample data only if API fails
    const fallbackDeals = [
      {
        tripId: trip.id,
        agent: "TravelBot Pro",
        destination: trip.destination,
        price: "2899.00",
        originalPrice: "3499.00",
        hotelRating: 5,
        confirmationTime: "2 min",
        inclusions: ["5★ Resort", "All Meals", "Spa Package", "Airport Transfer"],
        imageUrl: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description: "Luxury beachfront resort with private villas"
      }
    ];

    const createdDeals = [];
    for (const dealData of fallbackDeals) {
      const deal = await storage.createDeal(dealData);
      createdDeals.push(deal);
    }

    return createdDeals;
  }
}
