PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_equipment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`type` text,
	`brand` text,
	`model` text,
	`specifications` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_equipment`("id", "user_id", "type", "brand", "model", "specifications", "notes", "created_at") SELECT "id", "user_id", "type", "brand", "model", "specifications", "notes", "created_at" FROM `equipment`;--> statement-breakpoint
DROP TABLE `equipment`;--> statement-breakpoint
ALTER TABLE `__new_equipment` RENAME TO `equipment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_fishing_trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
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
INSERT INTO `__new_fishing_trips`("id", "user_id", "location_id", "trip_date", "start_time", "end_time", "title", "notes", "rating", "created_at", "updated_at") SELECT "id", "user_id", "location_id", "trip_date", "start_time", "end_time", "title", "notes", "rating", "created_at", "updated_at" FROM `fishing_trips`;--> statement-breakpoint
DROP TABLE `fishing_trips`;--> statement-breakpoint
ALTER TABLE `__new_fishing_trips` RENAME TO `fishing_trips`;--> statement-breakpoint
CREATE TABLE `__new_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
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
INSERT INTO `__new_locations`("id", "user_id", "name", "latitude", "longitude", "description", "water_type", "rating", "car_difficulty", "walk_difficulty", "created_at", "updated_at") SELECT "id", "user_id", "name", "latitude", "longitude", "description", "water_type", "rating", "car_difficulty", "walk_difficulty", "created_at", "updated_at" FROM `locations`;--> statement-breakpoint
DROP TABLE `locations`;--> statement-breakpoint
ALTER TABLE `__new_locations` RENAME TO `locations`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_location_idx` ON `locations` (`user_id`,`latitude`,`longitude`);