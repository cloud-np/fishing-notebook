// https://www.better-auth.com/docs/concepts/database#generating-schema
// pnpx @better-auth/cli migrate could be used as well
// However this approach is more flexible and allows for customization

import Database from "better-sqlite3";

const db = new Database("./auth.sqlite");

console.log("Creating database tables...");

try {
	// Drop existing user table if it exists (for clean migration)
	db.exec(`DROP TABLE IF EXISTS user;`);

	// Create user table with all required columns
	db.exec(`
		CREATE TABLE user (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			emailVerified INTEGER NOT NULL DEFAULT 0,
			name TEXT NOT NULL,
			image TEXT,
			twoFactorEnabled INTEGER DEFAULT 0,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL
		);
	`);

	// Drop and recreate all tables for consistency
	db.exec(`DROP TABLE IF EXISTS session;`);
	db.exec(`DROP TABLE IF EXISTS account;`);
	db.exec(`DROP TABLE IF EXISTS verification;`);
	db.exec(`DROP TABLE IF EXISTS passkey;`);
	db.exec(`DROP TABLE IF EXISTS twoFactor;`);

	// Create session table
	db.exec(`
		CREATE TABLE session (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			expiresAt INTEGER NOT NULL,
			token TEXT NOT NULL UNIQUE,
			ipAddress TEXT,
			userAgent TEXT,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	// Create account table
	db.exec(`
		CREATE TABLE account (
			id TEXT PRIMARY KEY,
			userId TEXT NOT NULL,
			accountId TEXT NOT NULL,
			providerId TEXT NOT NULL,
			accessToken TEXT,
			refreshToken TEXT,
			expiresAt INTEGER,
			password TEXT,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	// Create verification table
	db.exec(`
		CREATE TABLE verification (
			id TEXT PRIMARY KEY,
			identifier TEXT NOT NULL,
			value TEXT NOT NULL,
			expiresAt INTEGER NOT NULL,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL
		);
	`);

	// Create passkey table (for passkey plugin)
	db.exec(`
		CREATE TABLE passkey (
			id TEXT PRIMARY KEY,
			name TEXT,
			publicKey TEXT NOT NULL,
			userId TEXT NOT NULL,
			webauthnUserID TEXT NOT NULL,
			counter INTEGER NOT NULL,
			deviceType TEXT NOT NULL,
			backedUp INTEGER NOT NULL,
			transports TEXT,
			createdAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	// Create twoFactor table (for two-factor plugin)
	db.exec(`
		CREATE TABLE twoFactor (
			id TEXT PRIMARY KEY,
			secret TEXT NOT NULL,
			backupCodes TEXT NOT NULL,
			userId TEXT NOT NULL,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL,
			FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
		);
	`);

	console.log("✅ Database tables created successfully!");
	console.log("Tables created: user, session, account, verification, passkey, twoFactor");

	db.close();
} catch (error) {
	console.error("❌ Error creating tables:", error);
	db.close();
	process.exit(1);
}
