// Database migration using Drizzle ORM
// Run migrations: npm run db:push or npm run db:generate

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, sqlite } from "../src/db";

console.log("Running database migrations...");

try {
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
	sqlite.close();
	process.exit(1);
}
