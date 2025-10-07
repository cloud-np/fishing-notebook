// https://www.better-auth.com/docs/concepts/database#generating-schema
// pnpx @better-auth/cli migrate could be used as well
// However this approach is more flexible and allows for customization

import Database from "better-sqlite3";

const db = new Database("./auth.sqlite");
db.pragma("foreign_keys = ON");

console.log("Creating database tables...");

try {
	// Drop existing user table if it exists (for clean migration)
	db.exec(`DROP TABLE IF EXISTS user;`);

	// Create user table with all required columns
	db.exec(`
		CREATE TABLE user (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			emailVerified INTEGER NOT NULL DEFAULT 0,
			name TEXT NOT NULL,
			image TEXT,
			twoFactorEnabled INTEGER DEFAULT 0,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL
		);
	`);

	// Drop and recreate all tables for consistency
	db.exec(`DROP TABLE IF EXISTS session;`);
	db.exec(`DROP TABLE IF EXISTS account;`);
	db.exec(`DROP TABLE IF EXISTS verification;`);
	db.exec(`DROP TABLE IF EXISTS passkey;`);
	db.exec(`DROP TABLE IF EXISTS twoFactor;`);

	// Create session table
	db.exec(`
		CREATE TABLE session (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			expiresAt INTEGER NOT NULL,
			token TEXT NOT NULL UNIQUE,
			ipAddress TEXT,
			userAgent TEXT,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	// Create account table
	db.exec(`
		CREATE TABLE account (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			accountId TEXT NOT NULL,
			providerId TEXT NOT NULL,
			accessToken TEXT,
			refreshToken TEXT,
			expiresAt INTEGER,
			password TEXT,
			scope TEXT,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	// Create verification table
	db.exec(`
		CREATE TABLE verification (
			id TEXT PRIMARY KEY,
			identifier TEXT NOT NULL,
			value TEXT NOT NULL,
			expiresAt INTEGER NOT NULL,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL
		);
	`);

	// Create passkey table (for passkey plugin)
	db.exec(`
		CREATE TABLE passkey (
			id TEXT PRIMARY KEY,
			name TEXT,
			publicKey TEXT NOT NULL,
			userId TEXT NOT NULL,
			webauthnUserID TEXT NOT NULL,
			counter INTEGER NOT NULL,
			deviceType TEXT NOT NULL,
			backedUp INTEGER NOT NULL,
			transports TEXT,
			createdAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	// Create twoFactor table (for two-factor plugin)
	db.exec(`
		CREATE TABLE twoFactor (
			id TEXT PRIMARY KEY,
			secret TEXT NOT NULL,
			backupCodes TEXT NOT NULL,
			userId TEXT NOT NULL,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);
	// Locations table - store fishing spots
	db.exec(`
		CREATE TABLE IF NOT EXISTS locations (
		    id INTEGER PRIMARY KEY AUTOINCREMENT,
		    user_id INTEGER NOT NULL,
		    name TEXT NOT NULL,
		    latitude REAL NOT NULL,
		    longitude REAL NOT NULL,
		    description TEXT,
		    water_type TEXT CHECK(water_type IN ('freshwater', 'saltwater', 'brackish')),
		    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`);

	// Fishing trips table - main log entry for each fishing day
	db.exec(`
		CREATE TABLE IF NOT EXISTS fishing_trips (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			location_id INTEGER,
			trip_date DATE NOT NULL,
			start_time TIME,
			end_time TIME,
			title TEXT,
			notes TEXT,
			water_clarity TEXT CHECK(water_clarity IN ('clear', 'stained', 'murky', 'muddy')),
			water_temperature REAL, -- in Celsius
			tide_stage TEXT CHECK(tide_stage IN ('high', 'low', 'rising', 'falling')),
			moon_phase TEXT,
			success_rating INTEGER CHECK(success_rating BETWEEN 1 AND 5),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
		);
	`);

	// Fish species reference table
	db.exec(`
		CREATE TABLE IF NOT EXISTS fish_species (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			common_name TEXT NOT NULL,
			scientific_name TEXT,
			category TEXT CHECK(category IN ('freshwater', 'saltwater', 'both')),
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// Catches table - individual fish caught
	db.exec(`
		CREATE TABLE IF NOT EXISTS catches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			trip_id INTEGER NOT NULL,
			species_id INTEGER,
			species_custom TEXT, -- for unlisted species
			quantity INTEGER DEFAULT 1,
			length REAL, -- in cm
			weight REAL, -- in kg
			time_caught TIME,
			bait_lure TEXT,
			technique TEXT,
			kept BOOLEAN DEFAULT 0,
			photo_url TEXT,
			notes TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (trip_id) REFERENCES fishing_trips(id) ON DELETE CASCADE,
			FOREIGN KEY (species_id) REFERENCES fish_species(id) ON DELETE SET NULL
		);
	`);

	// Weather data table - stores Open-Meteo historical data
	db.exec(`
		CREATE TABLE IF NOT EXISTS weather_data (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			trip_id INTEGER NOT NULL,
			latitude REAL NOT NULL,
			longitude REAL NOT NULL,
			date DATE NOT NULL,

			-- Temperature (2m above ground)
			temperature_max REAL, -- °C
			temperature_min REAL, -- °C
			temperature_mean REAL, -- °C
			apparent_temperature_max REAL, -- °C
			apparent_temperature_min REAL, -- °C

			-- Precipitation
			precipitation_sum REAL, -- mm
			precipitation_hours REAL, -- hours
			rain_sum REAL, -- mm

			-- Pressure
			pressure_msl_mean REAL, -- hPa (mean sea level)

			-- Wind
			wind_speed_max REAL, -- km/h
			wind_gusts_max REAL, -- km/h
			wind_direction_dominant INTEGER, -- degrees

			-- Cloud cover and visibility
			cloud_cover_mean REAL, -- %

			-- Humidity
			relative_humidity_mean REAL, -- %

			-- Solar radiation
			shortwave_radiation_sum REAL, -- MJ/m²
			et0_fao_evapotranspiration REAL, -- mm

			-- Sunshine
			sunshine_duration REAL, -- seconds
			daylight_duration REAL, -- seconds

			-- Weather condition code
			weather_code INTEGER, -- WMO code

			-- UV Index
			uv_index_max REAL,

			-- Timestamps
			sunrise TIME,
			sunset TIME,

			fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,

			FOREIGN KEY (trip_id) REFERENCES fishing_trips(id) ON DELETE CASCADE,
			UNIQUE(trip_id) -- One weather record per trip
		);
	`);

	// Lunar/Solar data table - moon phases, tides influence
	db.exec(`
		CREATE TABLE IF NOT EXISTS lunar_solar_data (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			trip_id INTEGER NOT NULL,
			date DATE NOT NULL,

			-- Moon data
			moon_phase TEXT, -- new, waxing_crescent, first_quarter, waxing_gibbous, full, waning_gibbous, last_quarter, waning_crescent
			moon_illumination REAL, -- 0-100%
			moon_age REAL, -- days since new moon

			-- Lunar position
			moonrise TIME,
			moonset TIME,

			-- Solar position (already in weather but keeping separate for clarity)
			sunrise TIME,
			sunset TIME,
			day_length INTEGER, -- minutes

			-- Solunar periods (best fishing times)
			major_period_1_start TIME,
			major_period_1_end TIME,
			major_period_2_start TIME,
			major_period_2_end TIME,
			minor_period_1_start TIME,
			minor_period_1_end TIME,
			minor_period_2_start TIME,
			minor_period_2_end TIME,

			solunar_rating INTEGER CHECK(solunar_rating BETWEEN 1 AND 5), -- fishing activity prediction

			fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,

			FOREIGN KEY (trip_id) REFERENCES fishing_trips(id) ON DELETE CASCADE,
			UNIQUE(trip_id)
		);
	`);

	// Equipment table - rods, reels, lines used
	db.exec(`
		CREATE TABLE IF NOT EXISTS equipment (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			type TEXT CHECK(type IN ('rod', 'reel', 'line', 'lure', 'bait', 'other')),
			brand TEXT,
			model TEXT,
			specifications TEXT, -- JSON string for flexible specs
			notes TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`);

	// Trip equipment junction table
	db.exec(`
		CREATE TABLE IF NOT EXISTS trip_equipment (
			trip_id INTEGER NOT NULL,
			equipment_id INTEGER NOT NULL,
			PRIMARY KEY (trip_id, equipment_id),
			FOREIGN KEY (trip_id) REFERENCES fishing_trips(id) ON DELETE CASCADE,
			FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
		);
	`);

	// Create indexes for better query performance
	db.exec(`
		  CREATE INDEX IF NOT EXISTS idx_trips_user_date ON fishing_trips(user_id, trip_date);
		  CREATE INDEX IF NOT EXISTS idx_trips_location ON fishing_trips(location_id);
		  CREATE INDEX IF NOT EXISTS idx_catches_trip ON catches(trip_id);
		  CREATE INDEX IF NOT EXISTS idx_catches_species ON catches(species_id);
		  CREATE INDEX IF NOT EXISTS idx_weather_trip ON weather_data(trip_id);
		  CREATE INDEX IF NOT EXISTS idx_weather_date ON weather_data(date);
		  CREATE INDEX IF NOT EXISTS idx_lunar_trip ON lunar_solar_data(trip_id);
		  CREATE INDEX IF NOT EXISTS idx_locations_user ON locations(user_id);
		  CREATE INDEX IF NOT EXISTS idx_equipment_user ON equipment(user_id);
	`);

	console.log("Database tables created successfully!");

	db.close();
} catch (error) {
	console.error("❌ Error creating tables:", error);
	db.close();
	process.exit(1);
}

// Export helper functions
export function insertFishingTrip(trip: {
	user_id: number;
	location_id?: number;
	trip_date: string;
	start_time?: string;
	end_time?: string;
	title?: string;
	notes?: string;
	water_clarity?: string;
	water_temperature?: number;
	tide_stage?: string;
	moon_phase?: string;
	success_rating?: number;
}) {
	const stmt = db.prepare(`
    INSERT INTO fishing_trips (
      user_id, location_id, trip_date, start_time, end_time, title, notes,
      water_clarity, water_temperature, tide_stage, moon_phase, success_rating
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

	return stmt.run(
		trip.user_id,
		trip.location_id || null,
		trip.trip_date,
		trip.start_time || null,
		trip.end_time || null,
		trip.title || null,
		trip.notes || null,
		trip.water_clarity || null,
		trip.water_temperature || null,
		trip.tide_stage || null,
		trip.moon_phase || null,
		trip.success_rating || null
	);
}

export function insertWeatherData(weather: {
	trip_id: number;
	latitude: number;
	longitude: number;
	date: string;
	[key: string]: any; // Open-Meteo fields
}) {
	const stmt = db.prepare(`
    INSERT INTO weather_data (
      trip_id, latitude, longitude, date,
      temperature_max, temperature_min, temperature_mean,
      apparent_temperature_max, apparent_temperature_min,
      precipitation_sum, precipitation_hours, rain_sum,
      pressure_msl_mean, wind_speed_max, wind_gusts_max, wind_direction_dominant,
      cloud_cover_mean, relative_humidity_mean,
      shortwave_radiation_sum, et0_fao_evapotranspiration,
      sunshine_duration, daylight_duration,
      weather_code, uv_index_max, sunrise, sunset
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

	return stmt.run(
		weather.trip_id,
		weather.latitude,
		weather.longitude,
		weather.date,
		weather.temperature_max || null,
		weather.temperature_min || null,
		weather.temperature_mean || null,
		weather.apparent_temperature_max || null,
		weather.apparent_temperature_min || null,
		weather.precipitation_sum || null,
		weather.precipitation_hours || null,
		weather.rain_sum || null,
		weather.pressure_msl_mean || null,
		weather.wind_speed_max || null,
		weather.wind_gusts_max || null,
		weather.wind_direction_dominant || null,
		weather.cloud_cover_mean || null,
		weather.relative_humidity_mean || null,
		weather.shortwave_radiation_sum || null,
		weather.et0_fao_evapotranspiration || null,
		weather.sunshine_duration || null,
		weather.daylight_duration || null,
		weather.weather_code || null,
		weather.uv_index_max || null,
		weather.sunrise || null,
		weather.sunset || null
	);
}

export function getTripWithWeather(tripId: number) {
	return db
		.prepare(
			`
	    SELECT
	      t.*,
	      w.*,
	      l.name as location_name,
	      l.latitude,
	      l.longitude
	    FROM fishing_trips t
	    LEFT JOIN weather_data w ON t.id = w.trip_id
	    LEFT JOIN locations l ON t.location_id = l.id
	    WHERE t.id = ?
	`
		)
		.get(tripId);
}
