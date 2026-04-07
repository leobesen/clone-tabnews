import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const envFilePath = path.resolve(currentDirectoryPath, "../.env.development");

dotenv.config({
  path: envFilePath,
});

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? true : false,
});

async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

async function query(queryObject) {
  try {
    const res = await pool.query(queryObject);
    return res;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
}

async function close() {
  await pool.end();
}

async function getPGVersion() {
  const res = await query("SHOW server_version;");
  return res.rows[0].server_version;
}

async function getPGMaxConnections() {
  const res = await query("SHOW max_connections;");
  return res.rows[0].max_connections;
}

async function getPGOpenedConnections(databaseName = "local_db") {
  const res = await query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  return res.rows[0].count;
}

export default {
  query,
  close,
  getClient,
  getPGVersion,
  getPGMaxConnections,
  getPGOpenedConnections,
};
