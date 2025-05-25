import { users, trips, deals, agentLogs, agents, chatLogs, type User, type InsertUser, type Trip, type InsertTrip, type Deal, type InsertDeal, type AgentLog, type InsertAgentLog, type Agent, type InsertAgent, type ChatLog, type InsertChatLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";

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

  // Chat log methods
  createChatLog(insertChatLog: InsertChatLog): Promise<ChatLog>;
  getChatLogsByTripId(tripId: number): Promise<ChatLog[]>;
  getChatLogsByAgent(agent: string): Promise<ChatLog[]>;
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
    const [result] = await db
      .insert(users)
      .values(insertUser);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, result.insertId));

    return user;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [result] = await db
      .insert(trips)
      .values(insertTrip);

    const [trip] = await db
      .select()
      .from(trips)
      .where(eq(trips.id, result.insertId));

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
    const [result] = await db
      .insert(deals)
      .values({
        ...insertDeal,
        tripId: insertDeal.tripId || null
      });

    // MySQL doesn't support returning, so we need to fetch the inserted record
    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, result.insertId));

    return deal;
  }

  async getDealsByTripId(tripId: number): Promise<Deal[]> {
    return await db.select().from(deals).where(eq(deals.tripId, tripId));
  }

  async getAllDeals(): Promise<Deal[]> {
    const dealsFromDb = await db.select().from(deals);
    return dealsFromDb.map(deal => ({
      ...deal,
      inclusions: typeof deal.inclusions === 'string'
        ? JSON.parse(deal.inclusions)
        : deal.inclusions
    }));
  }

  async createAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const [result] = await db
      .insert(agentLogs)
      .values(insertLog);

    const [log] = await db
      .select()
      .from(agentLogs)
      .where(eq(agentLogs.id, result.insertId));

    return log;
  }

  async getAllAgentLogs(): Promise<AgentLog[]> {
    return await db.select().from(agentLogs).orderBy(desc(agentLogs.createdAt));
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [result] = await db
      .insert(agents)
      .values({
        ...insertAgent,
        isActive: insertAgent.isActive ?? true
      });

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, result.insertId));

    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    await db
      .update(agents)
      .set(updates)
      .where(eq(agents.id, id));

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id));

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

  // Chat log methods
  async createChatLog(insertChatLog: InsertChatLog): Promise<ChatLog> {
    const [result] = await db
      .insert(chatLogs)
      .values(insertChatLog);

    const [chatLog] = await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.id, result.insertId));

    return chatLog;
  }

  async getChatLogsByTripId(tripId: number): Promise<ChatLog[]> {
    return await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.tripId, tripId))
      .orderBy(chatLogs.timestamp);
  }

  async getChatLogsByAgent(agent: string): Promise<ChatLog[]> {
    return await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.agent, agent))
      .orderBy(desc(chatLogs.timestamp));
  }
}

// In-memory storage fallback
class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private trips: Trip[] = [];
  private deals: Deal[] = [];
  private agentLogs: AgentLog[] = [];
  private agents: Agent[] = [];
  private chatLogs: ChatLog[] = [];
  private nextId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.nextId++, createdAt: new Date() };
    this.users.push(user);
    return user;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const trip: Trip = { ...insertTrip, id: this.nextId++, createdAt: new Date() };
    this.trips.push(trip);
    return trip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.find(t => t.id === id);
  }

  async getAllTrips(): Promise<Trip[]> {
    return this.trips;
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const deal: Deal = {
      ...insertDeal,
      id: this.nextId++,
      createdAt: new Date(),
      tripId: insertDeal.tripId || null
    };
    this.deals.push(deal);
    return deal;
  }

  async getDealsByTripId(tripId: number): Promise<Deal[]> {
    return this.deals.filter(d => d.tripId === tripId);
  }

  async getAllDeals(): Promise<Deal[]> {
    return this.deals;
  }

  async createAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const log: AgentLog = { ...insertLog, id: this.nextId++, createdAt: new Date() };
    this.agentLogs.push(log);
    return log;
  }

  async getAllAgentLogs(): Promise<AgentLog[]> {
    return this.agentLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const agent: Agent = {
      ...insertAgent,
      id: this.nextId++,
      createdAt: new Date(),
      isActive: insertAgent.isActive ?? true
    };
    this.agents.push(agent);
    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.agents;
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    this.agents[index] = { ...this.agents[index], ...updates };
    return this.agents[index];
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

  // Chat log methods
  async createChatLog(insertChatLog: InsertChatLog): Promise<ChatLog> {
    const chatLog: ChatLog = {
      ...insertChatLog,
      id: this.nextId++,
      createdAt: new Date(),
      timestamp: insertChatLog.timestamp || new Date()
    };
    this.chatLogs.push(chatLog);
    return chatLog;
  }

  async getChatLogsByTripId(tripId: number): Promise<ChatLog[]> {
    return this.chatLogs
      .filter(log => log.tripId === tripId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getChatLogsByAgent(agent: string): Promise<ChatLog[]> {
    return this.chatLogs
      .filter(log => log.agent === agent)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Use database storage if available, otherwise use in-memory storage
export const storage = db ? new DatabaseStorage() : new InMemoryStorage();