CREATE TABLE `custom_places` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_custom_places_owner` ON `custom_places` (`owner_id`);--> statement-breakpoint
CREATE TABLE `place_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`place_id` text NOT NULL,
	`object_key` text NOT NULL,
	`caption` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_place_photos_owner_place` ON `place_photos` (`owner_id`,`place_id`);--> statement-breakpoint
CREATE TABLE `plans` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
