import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

const dbPath = import.meta.env.NODE_ENV === "production" ? "/app/data/fishing-app.sqlite" : "./fishing-app.sqlite";
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };

type WhereConditions = Record<string, unknown>;

export async function getDataFromDbByArgs<T extends SQLiteTable>(
	tableName: string,
	conditions: WhereConditions
): Promise<T["$inferSelect"] | undefined> {
	const table = (schema as any)[tableName] as T;

	if (!table) {
		throw new Error(`Table ${tableName} not found in schema`);
	}

	const whereClause = Object.entries(conditions).map(([key, value]) => eq(table[key], value));

	const result = await db
		.select()
		.from(table)
		.where(whereClause.length === 1 ? whereClause[0] : and(...whereClause))
		.limit(1);

	return result[0] as T["$inferSelect"] | undefined;
}
