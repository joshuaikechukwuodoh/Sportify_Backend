// db/schema.js
import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

/* USERS (you already had this; minor name/field cleanups) */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  display_name: text("display_name").notNull(),
  avatar_url: text("avatar_url").default(null),
  country: text("country").default(null),
  date_of_birth: text("date_of_birth").default(null),
  is_premium: boolean("is_premium").default(false).notNull(),
  subscription_tier: text("subscription_tier").default("free").notNull(),
  status: text("status").default("active").notNull(),
  role: varchar("role", { length: 50 }).default("user").notNull(), // add role here
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/* ARTISTS */
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio").default(null),
  image_url: varchar("image_url", { length: 1000 }).default(null),
  status: varchar("status", { length: 50 }).default("draft"), // draft|pending|approved|rejected
  submitted_by: text("submitted_by")
    .references(() => users.id)
    .nullable(),
  submitted_at: timestamp("submitted_at").nullable(),
  published_at: timestamp("published_at").nullable(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* ALBUMS */
export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  artist_id: integer("artist_id")
    .notNull()
    .references(() => artists.id),
  title: varchar("title", { length: 255 }).notNull(),
  release_date: timestamp("release_date").nullable(),
  cover_url: varchar("cover_url", { length: 1000 }).default(null),
  status: varchar("status", { length: 50 }).default("draft"),
  submitted_by: text("submitted_by")
    .references(() => users.id)
    .nullable(),
  submitted_at: timestamp("submitted_at").nullable(),
  published_at: timestamp("published_at").nullable(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* TRACKS */
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  album_id: integer("album_id")
    .references(() => albums.id)
    .nullable(),
  artist_id: integer("artist_id")
    .references(() => artists.id)
    .nullable(),
  title: varchar("title", { length: 255 }).notNull(),
  duration_seconds: integer("duration_seconds").nullable(),
  audio_url: varchar("audio_url", { length: 1000 }).default(null),
  track_number: integer("track_number").nullable(),
  status: varchar("status", { length: 50 }).default("draft"),
  submitted_by: text("submitted_by")
    .references(() => users.id)
    .nullable(),
  submitted_at: timestamp("submitted_at").nullable(),
  published_at: timestamp("published_at").nullable(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/* UPLOADS (uploadthing metadata) */
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  upload_type: varchar("upload_type", { length: 50 }).notNull(),
  file_key: text("file_key").notNull(),
  file_url: text("file_url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

/* ADMIN REVIEWS (audit log) */
export const admin_reviews = pgTable("admin_reviews", {
  id: serial("id").primaryKey(),
  item_type: varchar("item_type", { length: 50 }).notNull(), // "artist"|"album"|"track"
  item_id: integer("item_id").notNull(),
  admin_id: text("admin_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 50 }).notNull(), // approved|rejected
  reason: text("reason").nullable(),
  created_at: timestamp("created_at").defaultNow(),
});

// conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").default(null), // make title optional
  created_at: timestamp("created_at").defaultNow(),
});

// conversation_members
export const conversation_members = pgTable("conversation_members", {
  id: serial("id").primaryKey(),

  // conversation_id references conversations.id (integer)
  conversation_id: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  // user_id references users.id (text)
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  role: text("role").notNull(), // "user" or "artist" or other
  joined_at: timestamp("joined_at").defaultNow(),
});

// messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),

  // conversation FK
  conversation_id: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  // sender_id should be text (matches users.id)
  sender_id: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// conversation_reads (per-user read receipts)
export const conversation_reads = pgTable("conversation_reads", {
  id: serial("id").primaryKey(),

  conversation_id: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  last_read_at: timestamp("last_read_at").defaultNow(),
});

// payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(), // paystack reference
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),
  amount_kobo: integer("amount_kobo").notNull(),
  currency: text("currency").default("NGN").notNull(),
  status: text("status").default("pending").notNull(), // pending | success | failed
  metadata: text("metadata"), // JSON string: { trackId, ... }
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
