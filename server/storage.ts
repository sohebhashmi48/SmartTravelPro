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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db
      .insert(trips)
      .values(insertTrip)
      .returning();
    return trip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getAllTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db
      .insert(deals)
      .values({
        ...insertDeal,
        tripId: insertDeal.tripId || null
      })
      .returning();
    return deal;
  }

  async getDealsByTripId(tripId: number): Promise<Deal[]> {
    return await db.select().from(deals).where(eq(deals.tripId, tripId));
  }

  async getAllDeals(): Promise<Deal[]> {
    return await db.select().from(deals);
  }

  async createAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const [log] = await db
      .insert(agentLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getAllAgentLogs(): Promise<AgentLog[]> {
    return await db.select().from(agentLogs).orderBy(desc(agentLogs.createdAt));
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values({
        ...insertAgent,
        isActive: insertAgent.isActive ?? true
      })
      .returning();
    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    const [agent] = await db
      .update(agents)
      .set(updates)
      .where(eq(agents.id, id))
      .returning();
    return agent || undefined;
  }

  async getAgentAnalytics(): Promise<{
    avgPrice: number;
    mostPopularDestination: string;
    fastestConfirmation: string;
  }> {
    const logs = await this.getAllAgentLogs();
    const allDeals = await this.getAllDeals();
    
    // Calculate average price
    const avgPrice = logs.length > 0 
      ? logs.reduce((sum, log) => sum + parseFloat(log.price.toString()), 0) / logs.length
      : 2845;
    
    // Find most popular destination
    const destinationCounts = allDeals.reduce((acc, deal) => {
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

export const storage = new DatabaseStorage();