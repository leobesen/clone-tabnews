import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const pgVersion = await database.getPGVersion();
  const pgMaxConnections = await database.getPGMaxConnections();
  const pgCurrentUsedConnections = await database.getPGOpenedConnections();

  console.log("PostgreSQL Version:", pgVersion);
  console.log("PostgreSQL Max Connections:", pgMaxConnections);
  console.log("PostgreSQL Opened Connections:", pgCurrentUsedConnections);
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
