import { getPool } from "../db/pool.js";
import { runMigrations } from "../db/migrate.js";

const connectDB = async () => {
  try {
    getPool();
    await runMigrations();
    console.log("PostgreSQL (Neon) connected and schema is ready");
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
