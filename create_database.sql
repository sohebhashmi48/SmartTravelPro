-- SQLite Database Creation Script for SmartTravel Pro
-- Run this script to create the database tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT NOT NULL,
    duration TEXT NOT NULL,
    travel_type TEXT NOT NULL,
    budget TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    return_date TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER REFERENCES trips(id),
    agent TEXT NOT NULL,
    destination TEXT NOT NULL,
    price TEXT NOT NULL,
    original_price TEXT NOT NULL,
    hotel_rating INTEGER NOT NULL,
    confirmation_time TEXT NOT NULL,
    inclusions TEXT NOT NULL, -- JSON string
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- Create agent_logs table
CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent TEXT NOT NULL,
    price TEXT NOT NULL,
    hotel_rating INTEGER NOT NULL,
    delivery_time TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1, -- Boolean as integer
    avg_price TEXT,
    avg_confirmation_time TEXT,
    created_at INTEGER NOT NULL
);

-- Insert sample data
INSERT OR IGNORE INTO agents (name, is_active, avg_price, avg_confirmation_time, created_at) VALUES
('TravelBot Pro', 1, '2899.00', '2 min', strftime('%s', 'now')),
('VoyageAI', 1, '3200.00', '3 min', strftime('%s', 'now')),
('JourneyGenie', 1, '2750.00', '1.5 min', strftime('%s', 'now'));

-- Insert sample deals
INSERT OR IGNORE INTO deals (agent, destination, price, original_price, hotel_rating, confirmation_time, inclusions, image_url, description, created_at) VALUES
('TravelBot Pro', 'Bali', '2899.00', '3499.00', 5, '2 min', '["5★ Resort", "All Meals", "Spa Package", "Airport Transfer"]', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'Luxury beachfront resort with private villas', strftime('%s', 'now')),
('VoyageAI', 'Paris', '3200.00', '3800.00', 4, '3 min', '["4★ Hotel", "Breakfast", "City Tours", "Metro Pass"]', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'Charming boutique hotel in the heart of Paris', strftime('%s', 'now')),
('JourneyGenie', 'Tokyo', '2750.00', '3300.00', 5, '1.5 min', '["5★ Hotel", "All Meals", "Cultural Tours", "JR Pass"]', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'Modern luxury hotel with traditional Japanese service', strftime('%s', 'now'));

-- Insert sample agent logs
INSERT OR IGNORE INTO agent_logs (agent, price, hotel_rating, delivery_time, notes, created_at) VALUES
('TravelBot Pro', '2899.00', 5, '2 min', 'Trip to Bali for honeymoon', strftime('%s', 'now')),
('VoyageAI', '3200.00', 4, '3 min', 'Trip to Paris for family vacation', strftime('%s', 'now')),
('JourneyGenie', '2750.00', 5, '1.5 min', 'Trip to Tokyo for solo adventure', strftime('%s', 'now'));
