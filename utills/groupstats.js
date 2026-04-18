/**
 * 📊 Group Stats System - Mathithibala_Bot
 * Optimized by Professor Sahil
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/groupStats.json');

// In-memory cache (IMPORTANT FIX 🚀)
let cache = loadDB();

// ===============================
// 📥 LOAD DB
// ===============================
function loadDB() {
    try {
        if (!fs.existsSync(DB_PATH)) return {};
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch {
        return {};
    }
}

// ===============================
// 💾 SAVE DB (optimized with debounce)
// ===============================
let saveTimeout = null;

function saveDB(data) {
    try {
        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        }, 2000); // saves every 2s instead of instantly (prevents lag)

    } catch (err) {
        console.error('[groupStats] save error:', err);
    }
}

// ===============================
// 📩 ADD MESSAGE
// ===============================
function addMessage(groupId, senderId) {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours().toString();

    if (!cache[groupId]) cache[groupId] = {};
    if (!cache[groupId][today]) {
        cache[groupId][today] = {
            total: 0,
            users: {},
            hours: {}
        };
    }

    const g = cache[groupId][today];

    g.total++;
    g.users[senderId] = (g.users[senderId] || 0) + 1;
    g.hours[hour] = (g.hours[hour] || 0) + 1;

    saveDB(cache);
}

// ===============================
// 📊 GET STATS
// ===============================
function getStats(groupId) {
    const today = new Date().toISOString().slice(0, 10);

    if (!cache[groupId] || !cache[groupId][today]) return null;
    return cache[groupId][today];
}

// ===============================
// 🔄 REFRESH CACHE (optional safety)
// ===============================
function refreshCache() {
    cache = loadDB();
}

module.exports = {
    addMessage,
    getStats,
    refreshCache
};
