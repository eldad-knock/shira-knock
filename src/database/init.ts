import DatabaseConnection from "./connection";
import { join } from "path";
import { readFileSync } from "fs";

export async function initializeDatabase(): Promise<void> {
  const db = DatabaseConnection.getInstance();

  try {
    console.log("Initializing database...");

    await executeSchemaFile(db);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

async function executeSchemaFile(db: DatabaseConnection): Promise<void> {
  try {
    const schemaPath = join(__dirname, "schema.sql");
    const schemaContent = readFileSync(schemaPath, "utf8");

    await db.query(schemaContent);

    console.log("Schema executed successfully");
  } catch (error) {
    console.error("Error executing schema file:", error);
    throw error;
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  const db = DatabaseConnection.getInstance();
  return await db.healthCheck();
}
