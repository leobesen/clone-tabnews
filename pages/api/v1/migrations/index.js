import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const allowedMethods = ["POST", "GET"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({ error: "Method not allowed" });
  }
  let dbClient;
  try {
    dbClient = await database.getClient();
  } catch (error) {
    return response
      .status(500)
      .json({ error: "Failed to connect to the database" });
  }
  const defaultMigrationsConfig = {
    dbClient: dbClient,
    dryRun: false,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (request.method === "POST") {
    try {
      const migratedMigrations = await migrationRunner(defaultMigrationsConfig);
      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      } else {
        return response.status(200).json([]);
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    } finally {
      await dbClient.release();
    }
  }
  if (request.method === "GET") {
    try {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationsConfig,
        dryRun: true,
      });
      return response.status(200).json(pendingMigrations);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    } finally {
      await dbClient.release();
    }
  }
}

export default migrations;
