CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`athlete_id` text,
	`gear_id` text,
	`external_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`start_time` text NOT NULL,
	`distance` real,
	`duration` real,
	`elevation_gain` real,
	`average_hr` integer,
	`max_hr` integer,
	`average_power` integer,
	`normalized_power` integer,
	`tss` real,
	`trimp` real,
	`samples` text,
	`source_file` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gear_id`) REFERENCES `gear`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `athletes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer,
	`ftp` integer DEFAULT 250,
	`max_hr` integer DEFAULT 190,
	`weight` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `daily_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`athlete_id` text,
	`date` text NOT NULL,
	`ctl` real,
	`atl` real,
	`tsb` real,
	`sleep_score` integer,
	`readiness_score` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gear` (
	`id` text PRIMARY KEY NOT NULL,
	`athlete_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`brand` text,
	`model` text,
	`total_distance` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
