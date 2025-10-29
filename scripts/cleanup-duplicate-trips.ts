import { db } from "../src/db/index";
import { fishingTrips } from "../src/db/schema";
import { sql } from "drizzle-orm";

/**
 * This script finds and removes duplicate trips (same user_id and trip_date)
 * It keeps the most recently updated trip and removes older duplicates
 */
async function cleanupDuplicateTrips() {
	console.log("🔍 Finding duplicate trips...");

	// Find duplicates
	const duplicates = await db
		.select({
			userId: fishingTrips.userId,
			tripDate: fishingTrips.tripDate,
			count: sql<number>`count(*)`.as("count"),
		})
		.from(fishingTrips)
		.groupBy(fishingTrips.userId, fishingTrips.tripDate)
		.having(sql`count(*) > 1`);

	if (duplicates.length === 0) {
		console.log("✅ No duplicate trips found!");
		return;
	}

	console.log(`⚠️  Found ${duplicates.length} sets of duplicate trips`);

	let totalDeleted = 0;

	// For each set of duplicates, keep the most recent and delete the rest
	for (const dup of duplicates) {
		console.log(`\n📅 Processing duplicates for user ${dup.userId} on ${dup.tripDate} (${dup.count} trips)`);

		// Get all trips for this user and date, ordered by updatedAt DESC
		const trips = await db
			.select()
			.from(fishingTrips)
			.where(
				sql`${fishingTrips.userId} = ${dup.userId} AND ${fishingTrips.tripDate} = ${dup.tripDate}`
			)
			.orderBy(sql`${fishingTrips.updatedAt} DESC`);

		// Keep the first one (most recent), delete the rest
		const [keep, ...toDelete] = trips;

		console.log(`  ✓ Keeping trip ID ${keep.id} (updated: ${keep.updatedAt})`);

		for (const trip of toDelete) {
			console.log(`  ✗ Deleting trip ID ${trip.id} (updated: ${trip.updatedAt})`);
			await db.delete(fishingTrips).where(sql`${fishingTrips.id} = ${trip.id}`);
			totalDeleted++;
		}
	}

	console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} duplicate trips.`);
	console.log(`\n🚀 You can now run 'pnpm db:push' to apply the unique constraint.`);
}

// Run the cleanup
cleanupDuplicateTrips()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Error during cleanup:", error);
		process.exit(1);
	});
