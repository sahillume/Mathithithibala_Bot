/**
 * Centralized Temp Directory Management (PRODUCTION READY)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const TEMP_DIR = path.join(PROJECT_ROOT, 'temp');

/**
 * Initialize temp system (CALL THIS FIRST in index.js)
 */
function initializeTempSystem() {
  const tempDirAbsolute = path.resolve(TEMP_DIR);

  // Force all libs to use same temp directory
  process.env.TMPDIR = tempDirAbsolute;
  process.env.TMP = tempDirAbsolute;
  process.env.TEMP = tempDirAbsolute;

  if (process.platform === 'win32') {
    process.env.TMP = tempDirAbsolute;
    process.env.TEMP = tempDirAbsolute;
  }

  // Create temp directory safely
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  return TEMP_DIR;
}

/**
 * Get temp directory safely
 */
function getTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  return TEMP_DIR;
}

/**
 * Create temp file path
 */
function createTempFilePath(prefix = 'temp', ext = 'tmp') {
  const filename = `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  return path.join(getTempDir(), filename);
}

/**
 * Safe delete single temp file
 */
function deleteTempFile(filePath) {
  try {
    if (!filePath) return false;

    const resolved = path.resolve(filePath);
    const tempResolved = path.resolve(TEMP_DIR);

    // SECURITY: prevent deleting outside temp folder
    if (!resolved.startsWith(tempResolved)) {
      console.warn('[TEMP] Blocked unsafe delete:', filePath);
      return false;
    }

    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
      return true;
    }

    return false;
  } catch (err) {
    console.error('[TEMP] Delete error:', err.message);
    return false;
  }
}

/**
 * Delete multiple temp files safely
 */
function deleteTempFiles(files = []) {
  if (!Array.isArray(files)) return;

  for (const file of files) {
    deleteTempFile(file);
  }
}

module.exports = {
  initializeTempSystem,
  getTempDir,
  createTempFilePath,
  deleteTempFile,
  deleteTempFiles,
  TEMP_DIR
};
