/**
 * 🔥 Mathithibala_Bot Database System (Sahil Pro Safe Version)
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

// ===============================
// 🧠 CACHE
// ===============================
const cache = {
  groups: {},
  users: {},
  warnings: {},
  mods: { moderators: [] }
};

// ===============================
// 📦 SAFE JSON LOAD
// ===============================
const safeLoadJSON = (file, fallback) => {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
      return fallback;
    }

    const raw = fs.readFileSync(file, 'utf8').trim();
    if (!raw) return fallback;

    return JSON.parse(raw);
  } catch (err) {
    console.log(`⚠️ Fixed corrupted file: ${path.basename(file)}`);
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
};

// ===============================
// 📥 LOAD DB
// ===============================
const loadAll = () => {
  cache.groups = safeLoadJSON(FILES.groups, {});
  cache.users = safeLoadJSON(FILES.users, {});
  cache.warnings = safeLoadJSON(FILES.warnings, {});
  cache.mods = safeLoadJSON(FILES.mods, { moderators: [] });
};

loadAll();

// ===============================
// 💾 SAFE WRITE (ATOMIC)
// ===============================
const safeWrite = (file, data) => {
  try {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
    return true;
  } catch (err) {
    console.error('❌ DB Save Error:', err.message);
    return false;
  }
};

// ===============================
// 💾 AUTO SAVE
// ===============================
setInterval(() => {
  safeWrite(FILES.groups, cache.groups);
  safeWrite(FILES.users, cache.users);
  safeWrite(FILES.warnings, cache.warnings);
  safeWrite(FILES.mods, cache.mods);
}, 30000);

// ===============================
// 🛑 SAFE SHUTDOWN SAVE (IMPORTANT FIX)
// ===============================
process.on('SIGINT', () => {
  console.log('🛑 Saving DB before shutdown...');

  safeWrite(FILES.groups, cache.groups);
  safeWrite(FILES.users, cache.users);
  safeWrite(FILES.warnings, cache.warnings);
  safeWrite(FILES.mods, cache.mods);

  process.exit();
});

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

const updateGroupSettings = (groupId, data = {}) => {
  if (!groupId) return false;

  if (!cache.groups[groupId]) getGroupSettings(groupId);

  cache.groups[groupId] = {
    ...cache.groups[groupId],
    ...data,
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
      lastSeen: Date.now(),
      lastXpGain: 0
    };
  }

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
// ⭐ XP SYSTEM (ANTI-SPAM FIX)
// ===============================
const addXP = (userId, amount = 5) => {
  const user = getUser(userId);

  const now = Date.now();

  // anti spam XP (5 sec cooldown)
  if (now - user.lastXpGain < 5000) {
    return { levelUp: false };
  }

  user.lastXpGain = now;
  user.xp += amount;

  const needed = user.level * 100;

  if (user.xp >= needed) {
    user.level += 1;
    user.xp -= needed;

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

const clearWarnings = (groupId, userId) => {
  const key = `${groupId}_${userId}`;
  delete cache.warnings[key];
  return true;
};

// ===============================
// 🛡️ MOD SYSTEM (OWNER PROTECTED)
// ===============================
const getModerators = () => cache.mods.moderators;

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
// EXPORTS
// ===============================
module.exports = {
  getGroupSettings,
  updateGroupSettings,
  getUser,
  updateUser,
  addXP,
  getWarnings,
  addWarning,
  clearWarnings,
  getModerators,
  addModerator,
  removeModerator,
  isModerator
};
