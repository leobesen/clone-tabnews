import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const pgVersion = await database.getPGVersion();
  const pgMaxConnections = await database.getPGMaxConnections();
  const pgCurrentUsedConnections = await database.getPGCurrentUsedConnections();

  console.log("PostgreSQL Version:", pgVersion);
  console.log("PostgreSQL Max Connections:", pgMaxConnections);
  console.log("PostgreSQL Current Used Connections:", pgCurrentUsedConnections);
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: pgVersion,
        max_connections: pgMaxConnections,
        connections_used: pgCurrentUsedConnections,
      },
    },
  });
}

export default status;
