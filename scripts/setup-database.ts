#!/usr/bin/env tsx

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log("🔧 Setting up database...");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  console.log(`🔗 Using database URL: ${dbUrl.replace(/:\/\/.*@/, '://***@')}`);

  // Parse the database URL to get database name and connection details
  const url = new URL(dbUrl);
  const dbName = url.pathname.slice(1); // Remove leading slash
  const baseUrl = `${url.protocol}//${url.username}${url.password ? ':' + url.password : ''}@${url.hostname}${url.port ? ':' + url.port : ''}/postgres`;

  console.log(`🏗️  Checking if database '${dbName}' exists...`);

  let pool = new Pool({ connectionString: baseUrl });

  try {
    // Connect to the default postgres database to check if our target database exists
    const client = await pool.connect();
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`📝 Creating database '${dbName}'...`);
      
      // Create the database
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    } else {
      console.log(`✅ Database '${dbName}' already exists!`);
    }

    client.release();
    await pool.end();

    // Now connect to the actual database to verify connection
    pool = new Pool({ connectionString: dbUrl });
    const testClient = await pool.connect();
    
    console.log("✅ Successfully connected to the database!");
    testClient.release();
    await pool.end();

    return true;

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('does not exist')) {
        console.log("\n💡 Suggestion: Make sure PostgreSQL is running and the user has permission to create databases.");
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log("\n💡 Suggestion: Make sure PostgreSQL is running on your system.");
        console.log("   - On macOS: brew services start postgresql");
        console.log("   - On Ubuntu: sudo service postgresql start");
      }
    }
    
    return false;
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then((success) => {
      if (success) {
        console.log("🎉 Database setup completed successfully!");
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Database setup failed:", error);
      process.exit(1);
    });
}

export { setupDatabase };