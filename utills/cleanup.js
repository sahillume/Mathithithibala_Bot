const fs = require('fs');
const path = require('path');
const { getTempDir } = require('./tempManager');
const config = require('../config');

// ===============================
// ⚙️ SETTINGS
// ===============================
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const FILE_AGE_THRESHOLD_MS = 30 * 60 * 1000;
const SESSION_DIR_NAME = config.sessionName || 'session';

let cleanupInterval = null;

// ===============================
// 🧹 CLEANUP FUNCTION (SAFE)
// ===============================
async function cleanupOldFiles() {
  try {
    const tempDir = getTempDir();

    if (!fs.existsSync(tempDir)) return;

    const now = Date.now();
    const files = fs.readdirSync(tempDir);

    let deletedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);

      try {
        const stats = fs.statSync(filePath);

        // Skip directories safely
        if (stats.isDirectory()) {
          if (file.includes(SESSION_DIR_NAME)) continue;
          continue;
        }

        const age = now - stats.mtimeMs;

        if (age > FILE_AGE_THRESHOLD_MS) {
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          deletedCount++;
        }

      } catch (err) {
        // Ignore safe errors only
        continue;
      }
    }

    if (deletedCount > 0) {
      const mb = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`🧹 Cleanup: ${deletedCount} files removed (${mb} MB freed)`);
    }

  } catch (err) {
    console.error('[Cleanup Error]', err.message);
  }
}

// ===============================
// 🚀 START CLEANUP SYSTEM
// ===============================
function startCleanup() {
  console.log('🧹 Temp cleanup system starting...');

  cleanupOldFiles();

  cleanupInterval = setInterval(() => {
    cleanupOldFiles();
  }, CLEANUP_INTERVAL_MS);

  console.log('✅ Cleanup system active');
}

// ===============================
// 🛑 STOP CLEANUP SYSTEM
// ===============================
function stopCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('🛑 Cleanup stopped');
  }
}

// ===============================
// 🔐 SAFE EXIT HANDLERS
// ===============================
process.on('SIGINT', stopCleanup);
process.on('SIGTERM', stopCleanup);

// ===============================
module.exports = {
  cleanupOldFiles,
  startCleanup,
  stopCleanup
};
