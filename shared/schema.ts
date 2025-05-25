import { mysqlTable, varchar, int, decimal, boolean, timestamp, json, text } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = mysqlTable("trips", {
  id: int("id").primaryKey().autoincrement(),
  destination: varchar("destination", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  travelType: varchar("travel_type", { length: 100 }).notNull(),
  budget: varchar("budget", { length: 100 }).notNull(),
  departureDate: varchar("departure_date", { length: 50 }).notNull(),
  returnDate: varchar("return_date", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deals = mysqlTable("deals", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").references(() => trips.id),
  agent: varchar("agent", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  hotelRating: int("hotel_rating").notNull(),
  confirmationTime: varchar("confirmation_time", { length: 50 }).notNull(),
  inclusions: json("inclusions").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  // Enhanced deal information
  flightDetails: json("flight_details"),
  accommodationDetails: json("accommodation_details"),
  inclusionsBreakdown: json("inclusions_breakdown"),
  locationInfo: json("location_info"),
  bookingTerms: json("booking_terms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentLogs = mysqlTable("agent_logs", {
  id: int("id").primaryKey().autoincrement(),
  agent: varchar("agent", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  hotelRating: int("hotel_rating").notNull(),
  deliveryTime: varchar("delivery_time", { length: 50 }).notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }),
  avgConfirmationTime: varchar("avg_confirmation_time", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatLogs = mysqlTable("chat_logs", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").references(() => trips.id),
  agent: varchar("agent", { length: 255 }).notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull(), // 'user' or 'agent'
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata"), // Additional context like deal_id, step, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
});

export const insertAgentLogSchema = createInsertSchema(agentLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = z.infer<typeof insertAgentLogSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export const insertChatLogSchema = createInsertSchema(chatLogs).omit({
  id: true,
  createdAt: true,
});

export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = z.infer<typeof insertChatLogSchema>;
