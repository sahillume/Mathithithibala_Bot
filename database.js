/**
 * 🔥 Advanced JSON Database System (FIXED + STABLE + SAFE)
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// ===============================
// 📁 PATHS
// ===============================
const DB_PATH = path.join(__dirname, 'database');

const FILES = {
  groups: path.join(DB_PATH, 'groups.json'),
  users: path.join(DB_PATH, 'users.json'),
  warnings: path.join(DB_PATH, 'warnings.json'),
  mods: path.join(DB_PATH, 'mods.json')
};

// ===============================
// 🚀 INIT
// ===============================
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// In-memory cache
const cache = {
  groups: {},
  users: {},
  warnings: {},
  mods: { moderators: [] }
};

// ===============================
// 📦 SAFE JSON LOAD
// ===============================
const safeLoadJSON = (file, defaultData) => {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }

    const raw = fs.readFileSync(file, 'utf8').trim();
    if (!raw) return defaultData;

    return JSON.parse(raw);
  } catch (err) {
    console.error(`⚠️ Corrupted DB fixed: ${path.basename(file)}`);
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
};

// ===============================
// 📥 LOAD CACHE
// ===============================
const loadAll = () => {
  cache.groups = safeLoadJSON(FILES.groups, {});
  cache.users = safeLoadJSON(FILES.users, {});
  cache.warnings = safeLoadJSON(FILES.warnings, {});
  cache.mods = safeLoadJSON(FILES.mods, { moderators: [] });
};

loadAll();

// ===============================
// 💾 SAFE SAVE (ANTI-CORRUPTION)
// ===============================
const safeWrite = (file, data) => {
  try {
    const temp = file + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(data, null, 2));
    fs.renameSync(temp, file);
    return true;
  } catch (err) {
    console.error('❌ DB Write Error:', err.message);
    return false;
  }
};

// Auto-save every 30 seconds
setInterval(() => {
  safeWrite(FILES.groups, cache.groups);
  safeWrite(FILES.users, cache.users);
  safeWrite(FILES.warnings, cache.warnings);
  safeWrite(FILES.mods, cache.mods);
}, 30000);

// ===============================
// 👥 GROUP SYSTEM
// ===============================
const getGroupSettings = (groupId) => {
  if (!groupId) return {};

  if (!cache.groups[groupId]) {
    cache.groups[groupId] = {
      ...(config.defaultGroupSettings || {}),
      createdAt: Date.now()
    };
  }

  return cache.groups[groupId];
};

const updateGroupSettings = (groupId, settings = {}) => {
  if (!groupId) return false;

  if (!cache.groups[groupId]) getGroupSettings(groupId);

  cache.groups[groupId] = {
    ...cache.groups[groupId],
    ...settings,
    updatedAt: Date.now()
  };

  return true;
};

// ===============================
// 👤 USER SYSTEM
// ===============================
const getUser = (userId) => {
  if (!userId) return {};

  if (!cache.users[userId]) {
    cache.users[userId] = {
      registered: Date.now(),
      premium: false,
      banned: false,
      xp: 0,
      level: 1,
      lastSeen: Date.now()
    };
  }

  cache.users[userId].lastSeen = Date.now();
  return cache.users[userId];
};

const updateUser = (userId, data = {}) => {
  if (!userId) return false;

  if (!cache.users[userId]) getUser(userId);

  cache.users[userId] = {
    ...cache.users[userId],
    ...data
  };

  return true;
};

// ===============================
// ⭐ XP SYSTEM (IMPROVED)
// ===============================
const addXP = (userId, amount = 5) => {
  const user = getUser(userId);

  user.xp += amount;

  const neededXP = user.level * 100;

  if (user.xp >= neededXP) {
    user.level++;
    user.xp = user.xp - neededXP; // 🔥 carry extra XP

    return { levelUp: true, level: user.level };
  }

  return { levelUp: false };
};

// ===============================
// ⚠️ WARNING SYSTEM
// ===============================
const getWarnings = (groupId, userId) => {
  const key = `${groupId}_${userId}`;
  return cache.warnings[key] || { count: 0, warnings: [] };
};

const addWarning = (groupId, userId, reason = 'No reason') => {
  const key = `${groupId}_${userId}`;

  if (!cache.warnings[key]) {
    cache.warnings[key] = { count: 0, warnings: [] };
  }

  cache.warnings[key].count++;
  cache.warnings[key].warnings.push({
    reason,
    date: Date.now()
  });

  return cache.warnings[key];
};

const removeWarning = (groupId, userId) => {
  const key = `${groupId}_${userId}`;

  if (cache.warnings[key] && cache.warnings[key].count > 0) {
    cache.warnings[key].count--;
    cache.warnings[key].warnings.pop();
    return true;
  }

  return false;
};

const clearWarnings = (groupId, userId) => {
  const key = `${groupId}_${userId}`;
  delete cache.warnings[key];
  return true;
};

// ===============================
// 🛡️ MOD SYSTEM (FIXED SAFE)
// ===============================
const getModerators = () => {
  return cache.mods.moderators || [];
};

const addModerator = (userId) => {
  if (!userId) return false;

  if (!cache.mods.moderators.includes(userId)) {
    cache.mods.moderators.push(userId);
    return true;
  }
  return false;
};

const removeModerator = (userId) => {
  cache.mods.moderators = cache.mods.moderators.filter(id => id !== userId);
  return true;
};

const isModerator = (userId) => {
  return cache.mods.moderators.includes(userId);
};

// ===============================
module.exports = {
  getGroupSettings,
  updateGroupSettings,
  getUser,
  updateUser,
  addXP,
  getWarnings,
  addWarning,
  removeWarning,
  clearWarnings,
  getModerators,
  addModerator,
  removeModerator,
  isModerator
};
