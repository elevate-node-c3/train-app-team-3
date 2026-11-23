import client from "pg";

export async function setupDatabase() {
  const { Client } = client;
  const dbClient = new Client({
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.DB_PORT || process.env.POSTGRES_PORT) || 5432,
    user: process.env.DB_USER || process.env.POSTGRES_USER || "postgres",
    password:
      process.env.DB_PASS || process.env.POSTGRES_PASSWORD || "postgres",
    database: "postgres",
  });
  try {
    await dbClient.connect();

    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error("DB_NAME environment variable is not set");
    }

    console.log(`Checking if database ${dbName} exists...`);
    const dbExists = await dbClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (!dbExists.rows.length) {
      await dbClient.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    }
  } finally {
    await dbClient.end();
  }
}
