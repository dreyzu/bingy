import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runMigrations = async () => {
	const dbUrl = process.env.DB_URL;
	if (!dbUrl) throw new Error("DB_URL is not set");

	const sql = postgres(dbUrl, { max: 1 });
	const db = drizzle(sql);
	await migrate(db, { migrationsFolder: "./drizzle" });
	await sql.end();
};

await runMigrations();
