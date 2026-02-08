import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, names, InsertName, Name, generationHistory, InsertGenerationHistory, GenerationHistory } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Save generated names to database
 */
export async function saveNames(namesList: InsertName[]): Promise<Name[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save names: database not available");
    return [];
  }

  try {
    // Assign UUIDs to each name
    const namesWithIds = namesList.map(name => ({
      ...name,
      id: nanoid(36),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(names).values(namesWithIds);
    return namesWithIds as Name[];
  } catch (error) {
    console.error("[Database] Failed to save names:", error);
    throw error;
  }
}

/**
 * Get all names for a user
 */
export async function getNamesByUserId(userId: number): Promise<Name[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get names: database not available");
    return [];
  }

  try {
    const result = await db.select().from(names).where(eq(names.userId, userId));
    return result as Name[];
  } catch (error) {
    console.error("[Database] Failed to get names:", error);
    throw error;
  }
}

/**
 * Get collected names for a user
 */
export async function getCollectedNames(userId: number): Promise<Name[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get collected names: database not available");
    return [];
  }

  try {
    const result = await db.select().from(names).where(
      and(eq(names.userId, userId), eq(names.collected, true))
    );
    return result as Name[];
  } catch (error) {
    console.error("[Database] Failed to get collected names:", error);
    throw error;
  }
}

/**
 * Update name collection status
 */
export async function updateNameCollection(nameId: string, collected: boolean): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update name: database not available");
    return;
  }

  try {
    await db.update(names).set({ collected }).where(eq(names.id, nameId));
  } catch (error) {
    console.error("[Database] Failed to update name:", error);
    throw error;
  }
}

/**
 * Delete a name
 */
export async function deleteName(nameId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete name: database not available");
    return;
  }

  try {
    await db.delete(names).where(eq(names.id, nameId));
  } catch (error) {
    console.error("[Database] Failed to delete name:", error);
    throw error;
  }
}

/**
 * Save generation history
 */
export async function saveGenerationHistory(history: InsertGenerationHistory): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save generation history: database not available");
    return;
  }

  try {
    await db.insert(generationHistory).values({
      ...history,
      id: nanoid(36),
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to save generation history:", error);
    throw error;
  }
}

/**
 * Get generation history for a user
 */
export async function getGenerationHistory(userId: number): Promise<GenerationHistory[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get generation history: database not available");
    return [];
  }

  try {
    const result = await db.select().from(generationHistory).where(eq(generationHistory.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get generation history:", error);
    throw error;
  }
}
