import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// Better-auth tables
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
	name: text("name").notNull(),
	image: text("image"),
	twoFactorEnabled: integer("twoFactorEnabled", { mode: "boolean" }).default(false),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	expiresAt: integer("expiresAt", { mode: "timestamp" }),
	password: text("password"),
	scope: text("scope"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const passkey = sqliteTable("passkey", {
	id: text("id").primaryKey(),
	name: text("name"),
	publicKey: text("publicKey").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	webauthnUserID: text("webauthnUserID").notNull(),
	counter: integer("counter").notNull(),
	deviceType: text("deviceType").notNull(),
	backedUp: integer("backedUp", { mode: "boolean" }).notNull(),
	transports: text("transports"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const twoFactor = sqliteTable("twoFactor", {
	id: text("id").primaryKey(),
	secret: text("secret").notNull(),
	backupCodes: text("backupCodes").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Fishing app tables
export const locations = sqliteTable(
	"locations",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		latitude: real("latitude").notNull(),
		longitude: real("longitude").notNull(),
		description: text("description"),
		waterType: text("water_type", { enum: ["freshwater", "saltwater", "brackish"] }).default("saltwater"),
		rating: integer("rating"),
		carDifficulty: integer("car_difficulty"),
		walkDifficulty: integer("walk_difficulty"),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	table => ({
		userLocationIdx: uniqueIndex("user_location_idx").on(table.userId, table.latitude, table.longitude),
	})
);

export const fishingTrips = sqliteTable("fishing_trips", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	locationId: integer("location_id").references(() => locations.id, { onDelete: "set null" }),
	tripDate: text("trip_date").notNull(),
	startTime: text("start_time"),
	endTime: text("end_time"),
	title: text("title"),
	notes: text("notes"),
	rating: integer("rating"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const fishSpecies = sqliteTable("fish_species", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	commonName: text("common_name").notNull(),
	scientificName: text("scientific_name"),
	category: text("category", { enum: ["freshwater", "saltwater", "both"] }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const catches = sqliteTable("catches", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tripId: integer("trip_id")
		.notNull()
		.references(() => fishingTrips.id, { onDelete: "cascade" }),
	speciesId: integer("species_id").references(() => fishSpecies.id, { onDelete: "set null" }),
	speciesCustom: text("species_custom"),
	quantity: integer("quantity").default(1),
	length: real("length"),
	weight: real("weight"),
	timeCaught: text("time_caught"),
	baitLure: text("bait_lure"),
	technique: text("technique"),
	kept: integer("kept", { mode: "boolean" }).default(false),
	photoUrl: text("photo_url"),
	notes: text("notes"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const dailyWeather = sqliteTable("daily_weather", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	tripId: integer("trip_id")
		.notNull()
		.references(() => fishingTrips.id, { onDelete: "cascade" })
		.unique(),
	latitude: real("latitude").notNull(),
	longitude: real("longitude").notNull(),
	date: text("date").notNull(),

	// Weather condition code
	weatherCode: integer("weather_code"),

	// Temperature
	temperatureMax: real("temperature_max"),
	temperatureMin: real("temperature_min"),
	temperatureMean: real("temperature_mean"),
	apparentTemperatureMax: real("apparent_temperature_max"),
	apparentTemperatureMin: real("apparent_temperature_min"),
	apparentTemperatureMean: real("apparent_temperature_mean"),

	// Wind
	windSpeedMax: real("wind_speed_max"),
	windSpeedMean: real("wind_speed_mean"),
	windSpeedMin: real("wind_speed_min"),
	windGustsMax: real("wind_gusts_max"),
	windGustsMean: real("wind_gusts_mean"),
	windGustsMin: real("wind_gusts_min"),
	windDirectionDominant: integer("wind_direction_dominant"),

	// Solar radiation and sunshine
	shortwaveRadiationSum: real("shortwave_radiation_sum"),
	et0FaoEvapotranspiration: real("et0_fao_evapotranspiration"),
	et0FaoEvapotranspirationSum: real("et0_fao_evapotranspiration_sum"),
	sunshineDuration: real("sunshine_duration"),
	daylightDuration: real("daylight_duration"),

	// UV Index
	uvIndexMax: real("uv_index_max"),
	uvIndexClearSkyMax: real("uv_index_clear_sky_max"),

	// Precipitation
	precipitationProbabilityMax: real("precipitation_probability_max"),
	precipitationProbabilityMin: real("precipitation_probability_min"),
	precipitationProbabilityMean: real("precipitation_probability_mean"),
	precipitationHours: real("precipitation_hours"),
	precipitationSum: real("precipitation_sum"),
	showersSum: real("showers_sum"),
	rainSum: real("rain_sum"),
	snowfallSum: real("snowfall_sum"),
	snowfallWaterEquivalentSum: real("snowfall_water_equivalent_sum"),

	// Pressure
	pressureMslMin: real("pressure_msl_min"),
	pressureMslMax: real("pressure_msl_max"),
	pressureMslMean: real("pressure_msl_mean"),
	surfacePressureMean: real("surface_pressure_mean"),
	surfacePressureMin: real("surface_pressure_min"),
	surfacePressureMax: real("surface_pressure_max"),

	// Cloud cover
	cloudCoverMean: real("cloud_cover_mean"),
	cloudCoverMax: real("cloud_cover_max"),
	cloudCoverMin: real("cloud_cover_min"),

	// Humidity and dew point
	relativeHumidityMean: real("relative_humidity_mean"),
	relativeHumidityMin: real("relative_humidity_min"),
	relativeHumidityMax: real("relative_humidity_max"),
	dewPointMean: real("dew_point_mean"),
	dewPointMin: real("dew_point_min"),
	dewPointMax: real("dew_point_max"),

	// Wet bulb temperature
	wetBulbTemperatureMax: real("wet_bulb_temperature_max"),
	wetBulbTemperatureMean: real("wet_bulb_temperature_mean"),
	wetBulbTemperatureMin: real("wet_bulb_temperature_min"),

	// Vapor pressure deficit
	vapourPressureDeficitMax: real("vapour_pressure_deficit_max"),

	// Leaf wetness
	leafWetnessProbabilityMean: real("leaf_wetness_probability_mean"),

	// CAPE
	capeMean: real("cape_mean"),
	capeMax: real("cape_max"),
	capeMin: real("cape_min"),

	// Growing degree days
	growingDegreeDaysBase0Limit50: real("growing_degree_days_base_0_limit_50"),

	// Visibility
	visibilityMean: real("visibility_mean"),
	visibilityMin: real("visibility_min"),
	visibilityMax: real("visibility_max"),

	// Updraft
	updraftMax: real("updraft_max"),

	// Timestamps
	sunrise: text("sunrise"),
	sunset: text("sunset"),
	fetchedAt: integer("fetched_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const equipment = sqliteTable("equipment", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	type: text("type", { enum: ["rod", "reel", "line", "lure", "bait", "other"] }),
	brand: text("brand"),
	model: text("model"),
	specifications: text("specifications"),
	notes: text("notes"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const tripEquipment = sqliteTable("trip_equipment", {
	tripId: integer("trip_id")
		.notNull()
		.references(() => fishingTrips.id, { onDelete: "cascade" }),
	equipmentId: integer("equipment_id")
		.notNull()
		.references(() => equipment.id, { onDelete: "cascade" }),
});

// Relations
export const fishingTripsRelations = relations(fishingTrips, ({ one, many }) => ({
	location: one(locations, {
		fields: [fishingTrips.locationId],
		references: [locations.id],
	}),
	catches: many(catches),
	dailyWeather: one(dailyWeather),
	equipment: many(tripEquipment),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
	fishingTrips: many(fishingTrips),
}));

export const catchesRelations = relations(catches, ({ one }) => ({
	trip: one(fishingTrips, {
		fields: [catches.tripId],
		references: [fishingTrips.id],
	}),
	species: one(fishSpecies, {
		fields: [catches.speciesId],
		references: [fishSpecies.id],
	}),
}));

export const dailyWeatherRelations = relations(dailyWeather, ({ one }) => ({
	trip: one(fishingTrips, {
		fields: [dailyWeather.tripId],
		references: [fishingTrips.id],
	}),
}));

export const tripEquipmentRelations = relations(tripEquipment, ({ one }) => ({
	trip: one(fishingTrips, {
		fields: [tripEquipment.tripId],
		references: [fishingTrips.id],
	}),
	equipment: one(equipment, {
		fields: [tripEquipment.equipmentId],
		references: [equipment.id],
	}),
}));

export const equipmentRelations = relations(equipment, ({ many }) => ({
	trips: many(tripEquipment),
}));

export const fishSpeciesRelations = relations(fishSpecies, ({ many }) => ({
	catches: many(catches),
}));
