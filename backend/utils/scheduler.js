// backend/utils/scheduler.js
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../temp");

const cleanupTempDirectory = () => {
  try {
    if (!fs.existsSync(TEMP_DIR)) {
      console.log(`[${new Date().toISOString()}] Temp directory doesn't exist, skipping cleanup.`);
      return;
    }

    const files = fs.readdirSync(TEMP_DIR);
    let deletedCount = 0;
    
    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        // Delete files older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        if (stats.isFile() && stats.mtime.getTime() < oneHourAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (fileError) {
        console.error(`[${new Date().toISOString()}] Error deleting file ${file}:`, fileError.message);
      }
    });
    
    console.log(`[${new Date().toISOString()}] Temp directory cleanup completed. Deleted ${deletedCount} files.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error during cleanup:`, err.message);
  }
};

// Clean up immediately on startup (for any leftover files)
const initializeCleanup = () => {
  console.log("Initializing temp directory cleanup...");
  cleanupTempDirectory();
};

// Schedule cleanup every 30 minutes (more frequent than before)
const startScheduledCleanup = () => {
  cron.schedule("*/30 * * * *", () => {
    console.log("Running scheduled cleanup task...");
    cleanupTempDirectory();
  });
  
  console.log("Scheduler initialized. Cleanup will run every 30 minutes.");
};

export { cleanupTempDirectory, initializeCleanup, startScheduledCleanup };
