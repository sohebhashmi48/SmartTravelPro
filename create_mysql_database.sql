-- MySQL Database Creation Script for SmartTravel Pro
-- Run this script to create the database tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    travel_type VARCHAR(100) NOT NULL,
    budget VARCHAR(100) NOT NULL,
    departure_date VARCHAR(50) NOT NULL,
    return_date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    agent VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    hotel_rating INT NOT NULL,
    confirmation_time VARCHAR(50) NOT NULL,
    inclusions JSON NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    flight_details JSON,
    accommodation_details JSON,
    inclusions_breakdown JSON,
    location_info JSON,
    booking_terms JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- Create agent_logs table
CREATE TABLE IF NOT EXISTS agent_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    hotel_rating INT NOT NULL,
    delivery_time VARCHAR(50) NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avg_price DECIMAL(10,2),
    avg_confirmation_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_logs table
CREATE TABLE IF NOT EXISTS chat_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    agent VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- Insert sample data
INSERT IGNORE INTO agents (name, is_active, avg_price, avg_confirmation_time) VALUES
('TravelBot Pro', TRUE, 2899.00, '2 min'),
('VoyageAI', TRUE, 3200.00, '3 min'),
('JourneyGenie', TRUE, 2750.00, '1.5 min');

-- Insert sample deals
INSERT IGNORE INTO deals (agent, destination, price, original_price, hotel_rating, confirmation_time, inclusions, image_url, description) VALUES
('TravelBot Pro', 'Bali', 2899.00, 3499.00, 5, '2 min', '["5★ Resort", "All Meals", "Spa Package", "Airport Transfer"]', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'Luxury beachfront resort with private villas'),
('VoyageAI', 'Paris', 3200.00, 3800.00, 4, '3 min', '["4★ Hotel", "Breakfast", "City Tours", "Metro Pass"]', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'Charming boutique hotel in the heart of Paris'),
('JourneyGenie', 'Tokyo', 2750.00, 3300.00, 5, '1.5 min', '["5★ Hotel", "All Meals", "Cultural Tours", "JR Pass"]', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'Modern luxury hotel with traditional Japanese service');

-- Insert sample agent logs
INSERT IGNORE INTO agent_logs (agent, price, hotel_rating, delivery_time, notes) VALUES
('TravelBot Pro', 2899.00, 5, '2 min', 'Trip to Bali for honeymoon'),
('VoyageAI', 3200.00, 4, '3 min', 'Trip to Paris for family vacation'),
('JourneyGenie', 2750.00, 5, '1.5 min', 'Trip to Tokyo for solo adventure');
