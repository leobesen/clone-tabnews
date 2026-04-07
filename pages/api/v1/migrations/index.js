import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";


async function migrations(request, response) {
  const dbClient = await database.getClient();
  const defaultMigrationsConfig = {
    dbClient: dbClient,
    dryRun: false,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner(defaultMigrationsConfig);
    await dbClient.release();
    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    } else {
      return response.status(200).json([]);
    }
  }
  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsConfig,
      dryRun: true,
    });
    await dbClient.release();
    return response.status(200).json(pendingMigrations);
  }

  return response.status(405).json({ error: "Method not allowed" });
}

export default migrations;
