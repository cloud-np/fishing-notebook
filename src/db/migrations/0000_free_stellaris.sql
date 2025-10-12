CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` integer,
	`password` text,
	`scope` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `catches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`species_id` integer,
	`species_custom` text,
	`quantity` integer DEFAULT 1,
	`length` real,
	`weight` real,
	`time_caught` text,
	`bait_lure` text,
	`technique` text,
	`kept` integer DEFAULT false,
	`photo_url` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`species_id`) REFERENCES `fish_species`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `daily_weather` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`date` text NOT NULL,
	`weather_code` integer,
	`temperature_max` real,
	`temperature_min` real,
	`temperature_mean` real,
	`apparent_temperature_max` real,
	`apparent_temperature_min` real,
	`apparent_temperature_mean` real,
	`wind_speed_max` real,
	`wind_speed_mean` real,
	`wind_speed_min` real,
	`wind_gusts_max` real,
	`wind_gusts_mean` real,
	`wind_gusts_min` real,
	`wind_direction_dominant` integer,
	`shortwave_radiation_sum` real,
	`et0_fao_evapotranspiration` real,
	`et0_fao_evapotranspiration_sum` real,
	`sunshine_duration` real,
	`daylight_duration` real,
	`uv_index_max` real,
	`uv_index_clear_sky_max` real,
	`precipitation_probability_max` real,
	`precipitation_probability_min` real,
	`precipitation_probability_mean` real,
	`precipitation_hours` real,
	`precipitation_sum` real,
	`showers_sum` real,
	`rain_sum` real,
	`snowfall_sum` real,
	`snowfall_water_equivalent_sum` real,
	`pressure_msl_min` real,
	`pressure_msl_max` real,
	`pressure_msl_mean` real,
	`surface_pressure_mean` real,
	`surface_pressure_min` real,
	`surface_pressure_max` real,
	`cloud_cover_mean` real,
	`cloud_cover_max` real,
	`cloud_cover_min` real,
	`relative_humidity_mean` real,
	`relative_humidity_min` real,
	`relative_humidity_max` real,
	`dew_point_mean` real,
	`dew_point_min` real,
	`dew_point_max` real,
	`wet_bulb_temperature_max` real,
	`wet_bulb_temperature_mean` real,
	`wet_bulb_temperature_min` real,
	`vapour_pressure_deficit_max` real,
	`leaf_wetness_probability_mean` real,
	`cape_mean` real,
	`cape_max` real,
	`cape_min` real,
	`growing_degree_days_base_0_limit_50` real,
	`visibility_mean` real,
	`visibility_min` real,
	`visibility_max` real,
	`updraft_max` real,
	`sunrise` text,
	`sunset` text,
	`fetched_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_weather_trip_id_unique` ON `daily_weather` (`trip_id`);--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`type` text,
	`brand` text,
	`model` text,
	`specifications` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fish_species` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`common_name` text NOT NULL,
	`scientific_name` text,
	`category` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fishing_trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`location_id` integer,
	`trip_date` text NOT NULL,
	`start_time` text,
	`end_time` text,
	`title` text,
	`notes` text,
	`rating` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`description` text,
	`water_type` text DEFAULT 'saltwater',
	`rating` integer,
	`car_difficulty` integer,
	`walk_difficulty` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lunar_solar_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`date` text NOT NULL,
	`moon_phase` text,
	`moon_illumination` real,
	`moon_age` real,
	`moonrise` text,
	`moonset` text,
	`sunrise` text,
	`sunset` text,
	`day_length` integer,
	`major_period_1_start` text,
	`major_period_1_end` text,
	`major_period_2_start` text,
	`major_period_2_end` text,
	`minor_period_1_start` text,
	`minor_period_1_end` text,
	`minor_period_2_start` text,
	`minor_period_2_end` text,
	`solunar_rating` integer,
	`fetched_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lunar_solar_data_trip_id_unique` ON `lunar_solar_data` (`trip_id`);--> statement-breakpoint
CREATE TABLE `passkey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`publicKey` text NOT NULL,
	`userId` text NOT NULL,
	`webauthnUserID` text NOT NULL,
	`counter` integer NOT NULL,
	`deviceType` text NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `trip_equipment` (
	`trip_id` integer NOT NULL,
	`equipment_id` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `fishing_trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `twoFactor` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`backupCodes` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`twoFactorEnabled` integer DEFAULT false,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
