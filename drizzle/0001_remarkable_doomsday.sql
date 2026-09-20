CREATE TABLE `search_cache` (
	`query` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `search_lock` (
	`id` text PRIMARY KEY NOT NULL,
	`last_at` text NOT NULL
);
