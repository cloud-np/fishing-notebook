import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import type { GetSelectTableSelection, SelectResultField } from "drizzle-orm/query-builders/select.types";
import * as schema from "./schema";

const sqlite = new Database("./fishing-app.sqlite");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };

type TableName = keyof typeof schema;
type WhereConditions = Record<string, unknown>;

type SelectResult<T extends TableName> = {
	[Key in keyof GetSelectTableSelection<(typeof schema)[T]>]: SelectResultField<
		GetSelectTableSelection<(typeof schema)[T]>[Key],
		true
	>;
};

export async function getDataFromDbByArgs<T extends TableName>(
	tableName: T,
	conditions: WhereConditions
): Promise<SelectResult<T> | undefined> {
	const table = schema[tableName];

	if (!table) {
		throw new Error(`Table ${tableName} not found in schema`);
	}

	const whereClause = Object.entries(conditions).map(([key, value]) => eq(table[key], value));

	const result = await db
		.select()
		.from(table)
		.where(whereClause.length === 1 ? whereClause[0] : and(...whereClause))
		.limit(1);

	return result[0];
}
