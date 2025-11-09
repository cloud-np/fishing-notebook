// Database migration using Drizzle ORM
// Run migrations: npm run db:migrate or npm run db:generate

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../src/db/schema.js";

// Determine database path based on environment
const isProduction = process.env.NODE_ENV === "production" || process.env.PROD === "true";
const dbPath = isProduction ? "/app/data/fishing-app.sqlite" : "./fishing-app.sqlite";

console.log(`Running database migrations...`);
console.log(`Environment: ${isProduction ? "production" : "development"}`);
console.log(`Database path: ${dbPath}`);

let sqlite;

try {
	// Initialize database connection
	sqlite = new Database(dbPath);
	sqlite.pragma("foreign_keys = ON");

	const db = drizzle(sqlite, { schema });

	// Run migrations if migration files exist
	// Note: First run `npm run db:generate` to create migration files
	try {
		migrate(db, { migrationsFolder: "./src/db/migrations" });
		console.log("✅ Migrations completed successfully!");
	} catch (error) {
		console.error("⚠️  Migration error:", error);
		console.log("ℹ️  This might be expected if migrations were already applied.");
	}

	sqlite.close();
} catch (error) {
	console.error("❌ Error running migrations:", error);
	if (sqlite) {
		sqlite.close();
	}
	process.exit(1);
}
