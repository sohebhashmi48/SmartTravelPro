import { users, trips, deals, agentLogs, agents, type User, type InsertUser, type Trip, type InsertTrip, type Deal, type InsertDeal, type AgentLog, type InsertAgentLog, type Agent, type InsertAgent } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: number): Promise<Trip | undefined>;
  getAllTrips(): Promise<Trip[]>;
  
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDealsByTripId(tripId: number): Promise<Deal[]>;
  getAllDeals(): Promise<Deal[]>;
  
  createAgentLog(log: InsertAgentLog): Promise<AgentLog>;
  getAllAgentLogs(): Promise<AgentLog[]>;
  
  createAgent(agent: InsertAgent): Promise<Agent>;
  getAllAgents(): Promise<Agent[]>;
  updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined>;
  getAgentAnalytics(): Promise<{
    avgPrice: number;
    mostPopularDestination: string;
    fastestConfirmation: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private deals: Map<number, Deal>;
  private agentLogs: Map<number, AgentLog>;
  private agents: Map<number, Agent>;
  private currentUserId: number;
  private currentTripId: number;
  private currentDealId: number;
  private currentLogId: number;
  private currentAgentId: number;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.deals = new Map();
    this.agentLogs = new Map();
    this.agents = new Map();
    this.currentUserId = 1;
    this.currentTripId = 1;
    this.currentDealId = 1;
    this.currentLogId = 1;
    this.currentAgentId = 1;
    
    // Initialize with sample agents
    this.initializeAgents();
  }

  private initializeAgents() {
    const sampleAgents: InsertAgent[] = [
      {
        name: "TravelBot Pro",
        isActive: true,
        avgPrice: "2899.00",
        avgConfirmationTime: "2 min"
      },
      {
        name: "LuxuryAgent AI",
        isActive: true,
        avgPrice: "3299.00",
        avgConfirmationTime: "5 min"
      },
      {
        name: "BudgetTravel Bot",
        isActive: false,
        avgPrice: "1899.00",
        avgConfirmationTime: "3 min"
      }
    ];

    sampleAgents.forEach(agent => {
      this.createAgent(agent);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.currentTripId++;
    const trip: Trip = { 
      ...insertTrip, 
      id, 
      createdAt: new Date() 
    };
    this.trips.set(id, trip);
    return trip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getAllTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values());
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const deal: Deal = { 
      ...insertDeal, 
      id, 
      createdAt: new Date() 
    };
    this.deals.set(id, deal);
    return deal;
  }

  async getDealsByTripId(tripId: number): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.tripId === tripId);
  }

  async getAllDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async createAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const id = this.currentLogId++;
    const log: AgentLog = { 
      ...insertLog, 
      id, 
      createdAt: new Date() 
    };
    this.agentLogs.set(id, log);
    return log;
  }

  async getAllAgentLogs(): Promise<AgentLog[]> {
    return Array.from(this.agentLogs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async getAgentAnalytics(): Promise<{
    avgPrice: number;
    mostPopularDestination: string;
    fastestConfirmation: string;
  }> {
    const logs = Array.from(this.agentLogs.values());
    const deals = Array.from(this.deals.values());
    
    // Calculate average price
    const avgPrice = logs.length > 0 
      ? logs.reduce((sum, log) => sum + parseFloat(log.price.toString()), 0) / logs.length
      : 2845;
    
    // Find most popular destination
    const destinationCounts = deals.reduce((acc, deal) => {
      acc[deal.destination] = (acc[deal.destination] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularDestination = Object.keys(destinationCounts).length > 0
      ? Object.keys(destinationCounts).reduce((a, b) => 
          destinationCounts[a] > destinationCounts[b] ? a : b)
      : "Bali";
    
    // Find fastest confirmation time
    const fastestConfirmation = logs.length > 0
      ? logs.reduce((fastest, log) => {
          const currentTime = parseFloat(log.deliveryTime.replace(/[^\d.]/g, ''));
          const fastestTime = parseFloat(fastest.replace(/[^\d.]/g, ''));
          return currentTime < fastestTime ? log.deliveryTime : fastest;
        }, logs[0].deliveryTime)
      : "2.3 min";
    
    return {
      avgPrice,
      mostPopularDestination,
      fastestConfirmation
    };
  }
}

export const storage = new MemStorage();
