import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const customPlaces = sqliteTable("custom_places", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(),
  data: text("data").notNull(), createdAt: text("created_at").notNull(),
}, t => [index("idx_custom_places_owner").on(t.ownerId)]);

export const placePhotos = sqliteTable("place_photos", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(),
  placeId: text("place_id").notNull(), objectKey: text("object_key").notNull(),
  caption: text("caption").notNull(), createdAt: text("created_at").notNull(),
}, t => [index("idx_place_photos_owner_place").on(t.ownerId, t.placeId)]);

export const plans = sqliteTable("plans", {
  ownerId: text("owner_id").primaryKey(), data: text("data").notNull(),
});

export const searchCache = sqliteTable("search_cache", {
  query: text("query").primaryKey(), data: text("data").notNull(), updatedAt: text("updated_at").notNull(),
});
export const searchLock = sqliteTable("search_lock", {
  id: text("id").primaryKey(), lastAt: text("last_at").notNull(),
});
