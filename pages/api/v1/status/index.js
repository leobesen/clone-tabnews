import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const pgVersion = await database.getPGVersion();
  const pgMaxConnections = await database.getPGMaxConnections();
  const databaseName = request.query.database || process.env.POSTGRES_DB;
  const pgCurrentUsedConnections =
    await database.getPGOpenedConnections(databaseName);

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: pgVersion,
        max_connections: parseInt(pgMaxConnections, 10),
        opened_connections: pgCurrentUsedConnections,
      },
    },
  });
}

export default status;
