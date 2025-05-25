import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTripSchema, insertDealSchema, insertAgentLogSchema } from "@shared/schema";
import { z } from "zod";

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

// Helper function to generate mock deals for a trip
async function generateDealsForTrip(trip: any) {
  const mockDeals = [
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
    },
    {
      tripId: trip.id,
      agent: "LuxuryAgent AI",
      destination: trip.destination,
      price: "3299.00",
      originalPrice: "4199.00",
      hotelRating: 4,
      confirmationTime: "5 min",
      inclusions: ["4★ Hotel", "Breakfast", "Wine Tours", "Sunset Cruise"],
      imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "Iconic accommodation with premium amenities"
    },
    {
      tripId: trip.id,
      agent: "BudgetTravel Bot",
      destination: trip.destination,
      price: "1899.00",
      originalPrice: "2299.00",
      hotelRating: 4,
      confirmationTime: "3 min",
      inclusions: ["4★ Hotel", "City Tour", "Museum Pass", "Local Experience"],
      imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "Perfect balance of comfort and affordability"
    }
  ];

  const createdDeals = [];
  for (const dealData of mockDeals) {
    const deal = await storage.createDeal(dealData);
    createdDeals.push(deal);
  }

  return createdDeals;
}
