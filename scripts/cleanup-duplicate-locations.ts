import { db } from "../src/db/index";
import { locations, fishingTrips } from "../src/db/schema";
import { sql, eq } from "drizzle-orm";

async function cleanupDuplicateLocations() {
	console.log("Finding duplicate locations...");

	// Find duplicates grouped by user_id, latitude, longitude
	const duplicates = await db.all(sql`
		SELECT user_id, latitude, longitude, COUNT(*) as count
		FROM locations
		GROUP BY user_id, latitude, longitude
		HAVING COUNT(*) > 1
	`);

	console.log(`Found ${duplicates.length} duplicate location groups`);

	if (duplicates.length === 0) {
		console.log("No duplicates found!");
		return;
	}

	for (const dup of duplicates) {
		console.log(`\nProcessing duplicates for user ${dup.user_id} at (${dup.latitude}, ${dup.longitude})...`);

		// Get all locations with these coordinates for this user
		const allLocations = await db.query.locations.findMany({
			where: (locations, { and, eq }) =>
				and(
					eq(locations.userId, dup.user_id as string),
					eq(locations.latitude, dup.latitude as number),
					eq(locations.longitude, dup.longitude as number)
				),
			orderBy: (locations, { desc }) => [desc(locations.createdAt)],
		});

		// Keep the most recent one
		const [keepLocation, ...deleteLocations] = allLocations;
		console.log(`Keeping location ID ${keepLocation.id}, deleting ${deleteLocations.length} duplicates`);

		// Update fishing trips to point to the kept location
		for (const deleteLocation of deleteLocations) {
			await db
				.update(fishingTrips)
				.set({ locationId: keepLocation.id })
				.where(eq(fishingTrips.locationId, deleteLocation.id));

			// Delete the duplicate location
			await db.delete(locations).where(eq(locations.id, deleteLocation.id));
			console.log(`Deleted location ID ${deleteLocation.id}`);
		}
	}

	console.log("\n✅ Cleanup complete!");
}

cleanupDuplicateLocations()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Error cleaning up duplicates:", error);
		process.exit(1);
	});
