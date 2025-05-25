import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Create MySQL connection
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smarttravel',
  port: parseInt(process.env.DB_PORT || '3306')
});

export const db = drizzle(connection, { schema, mode: 'default' });