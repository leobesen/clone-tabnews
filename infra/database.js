import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
});

async function query(queryObject) {
  const res = await pool.query(queryObject);
  return res;
}

async function getPGVersion() {
  const res = await query("SHOW server_version;");
  return res.rows[0].server_version;
}

async function getPGMaxConnections() {
  const res = await query("SHOW max_connections;");
  return res.rows[0].max_connections;
}

async function getPGOpenedConnections() {
  const res = await query("SELECT count(*)::int FROM pg_stat_activity WHERE datname = 'local_db';");
  return res.rows[0].count;
}

export default {
  query,
  getPGVersion,
  getPGMaxConnections,
  getPGOpenedConnections,
};
