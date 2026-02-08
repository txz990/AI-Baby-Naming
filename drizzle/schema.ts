import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Generated baby names table
 * Stores all AI-generated names with their metadata and analysis
 */
export const names = mysqlTable("names", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  userId: int("userId").notNull(), // Reference to users table (optional for logged-in users)
  fullName: varchar("fullName", { length: 255 }).notNull(), // Complete name
  pinyin: varchar("pinyin", { length: 255 }).notNull(), // Pinyin pronunciation
  gender: mysqlEnum("gender", ["male", "female", "neutral"]).notNull(), // Gender
  source: text("source"), // Source from classics (e.g., 《诗经·小雅》)
  meaning: text("meaning"), // Deep meaning analysis
  fiveElements: varchar("fiveElements", { length: 50 }), // Five elements analysis (金木水火土)
  soundAnalysis: text("soundAnalysis"), // Sound/tone analysis
  score: int("score").default(90), // Recommendation score (90-100)
  collected: boolean("collected").default(false), // Whether collected by user
  generationParams: json("generationParams"), // Store original generation parameters for reference
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Name = typeof names.$inferSelect;
export type InsertName = typeof names.$inferInsert;

/**
 * Generation history table
 * Tracks all generation sessions for deduplication and history
 */
export const generationHistory = mysqlTable("generationHistory", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  userId: int("userId").notNull(), // Reference to users table
  sessionId: varchar("sessionId", { length: 36 }).notNull(), // Unique session ID for this generation
  generatedNames: json("generatedNames"), // Array of generated name IDs
  params: json("params"), // Generation parameters used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GenerationHistory = typeof generationHistory.$inferSelect;
export type InsertGenerationHistory = typeof generationHistory.$inferInsert;
