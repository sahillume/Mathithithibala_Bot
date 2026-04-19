/**
 * 💾 PRO JSON DATABASE SYSTEM - Mathithibala_Bot
 * Enhanced by Sahil System
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const DB_PATH = path.join(__dirname, 'database');

// ===============================
// 📁 FILE PATHS
// ===============================
const FILES = {
  groups: path.join(DB_PATH, 'groups.json'),
  users: path.join(DB_PATH, 'users.json'),
  warnings: path.join(DB_PATH, 'warnings.json'),
  mods: path.join(DB_PATH, 'mods.json')
};

// ===============================
// 🧠 IN-MEMORY CACHE (FAST ACCESS)
// ===============================
const cache = {
  groups: {},
  users: {},
  warnings: {},
  mods: { moderators: [] }
};

// ===============================
// 📁 INIT DATABASE FOLDER
// ===============================
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// ===============================
// 🧾 SAFE INIT FILE
// ===============================
const initFile = (file, defaultData) => {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    }
  } catch (e) {
    console.log('DB Init Error:', e.message);
  }
};

// ===============================
initFile(FILES.groups, {});
initFile(FILES.users, {});
initFile(FILES.warnings, {});
initFile(FILES.mods, { moderators: [] });

// ===============================
// 📥 SAFE READ
// ===============================
const readDB = (file) => {
  try {
    if (!fs.existsSync(file)) return {};

    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (e) {
    console.log('DB Read Error:', e.message);
    return {};
  }
};

// ===============================
// 📤 SAFE WRITE (ATOMIC)
// ===============================
const writeDB = (file, data) => {
  try {
    const temp = file + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(data, null, 2));
    fs.renameSync(temp, file);
    return true;
  } catch (e) {
    console.log('DB Write Error:', e.message);
    return false;
  }
};

// ===============================
// 🔄 LOAD CACHE ON START
// ===============================
const loadAll = () => {
  cache.groups = readDB(FILES.groups);
  cache.users = readDB(FILES.users);
  cache.warnings = readDB(FILES.warnings);
  cache.mods = readDB(FILES.mods);
};

loadAll();

// ===============================
// 💬 GROUP SETTINGS
// ===============================
const getGroupSettings = (gid) => {
  if (!cache.groups[gid]) {
    cache.groups[gid] = config.defaultGroupSettings || {};
    writeDB(FILES.groups, cache.groups);
  }
  return cache.groups[gid];
};

const updateGroupSettings = (gid, data) => {
  cache.groups[gid] = {
    ...(cache.groups[gid] || {}),
    ...data
  };
  return writeDB(FILES.groups, cache.groups);
};

// ===============================
// 👤 USERS
// ===============================
const getUser = (uid) => {
  if (!cache.users[uid]) {
    cache.users[uid] = {
      registered: Date.now(),
      premium: false,
      banned: false,
      xp: 0
    };
    writeDB(FILES.users, cache.users);
  }
  return cache.users[uid];
};

const updateUser = (uid, data) => {
  cache.users[uid] = {
    ...(cache.users[uid] || {}),
    ...data
  };
  return writeDB(FILES.users, cache.users);
};

// ===============================
// ⚠️ WARNINGS SYSTEM
// ===============================
const getWarnings = (gid, uid) => {
  const key = `${gid}_${uid}`;
  return cache.warnings[key] || { count: 0, warnings: [] };
};

const addWarning = (gid, uid, reason) => {
  const key = `${gid}_${uid}`;

  if (!cache.warnings[key]) {
    cache.warnings[key] = { count: 0, warnings: [] };
  }

  cache.warnings[key].count++;
  cache.warnings[key].warnings.push({
    reason,
    date: Date.now()
  });

  return writeDB(FILES.warnings, cache.warnings);
};

const clearWarnings = (gid, uid) => {
  const key = `${gid}_${uid}`;
  delete cache.warnings[key];
  return writeDB(FILES.warnings, cache.warnings);
};

// ===============================
// 👑 MOD SYSTEM
// ===============================
const getModerators = () => cache.mods.moderators || [];

const addModerator = (uid) => {
  if (!cache.mods.moderators.includes(uid)) {
    cache.mods.moderators.push(uid);
    return writeDB(FILES.mods, cache.mods);
  }
  return false;
};

const removeModerator = (uid) => {
  cache.mods.moderators =
    cache.mods.moderators.filter(x => x !== uid);
  return writeDB(FILES.mods, cache.mods);
};

const isModerator = (uid) => {
  return cache.mods.moderators.includes(uid);
};

// ===============================
// 📦 EXPORTS
// ===============================
module.exports = {
  getGroupSettings,
  updateGroupSettings,

  getUser,
  updateUser,

  getWarnings,
  addWarning,
  clearWarnings,

  getModerators,
  addModerator,
  removeModerator,
  isModerator,

  // optional debug
  _cache: cache
};
