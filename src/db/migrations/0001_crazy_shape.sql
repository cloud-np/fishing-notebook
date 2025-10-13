DROP TABLE `lunar_solar_data`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_location_idx` ON `locations` (`user_id`,`latitude`,`longitude`);