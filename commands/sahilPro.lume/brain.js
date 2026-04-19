/**
 * 🧠 Sahil Pro Brain System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Intelligence Core
 */

const db = require('../../database');

module.exports = {
  name: 'brain',
  category: 'sahilPro',
  description: 'Core memory + intelligence handler for AI system',

  // ===============================
  // 🧠 STORE MEMORY
  // ===============================
  async remember(userId, key, value) {
    try {
      const user = db.getUser(userId);

      if (!user.memory) user.memory = {};

      user.memory[key] = {
        value,
        time: Date.now()
      };

      db.updateUser(userId, user);

      return true;
    } catch (e) {
      console.log("Brain Memory Error:", e.message);
      return false;
    }
  },

  // ===============================
  // 🧠 GET MEMORY
  // ===============================
  async recall(userId, key) {
    try {
      const user = db.getUser(userId);

      if (!user.memory) return null;

      return user.memory[key]?.value || null;

    } catch (e) {
      console.log("Brain Recall Error:", e.message);
      return null;
    }
  },

  // ===============================
  // 🧠 BUILD CONTEXT (FOR AI)
  // ===============================
  async buildContext(userId) {
    try {
      const user = db.getUser(userId);

      if (!user.memory) return "";

      let context = "🧠 MEMORY CONTEXT:\n";

      for (const key in user.memory) {
        context += `- ${key}: ${user.memory[key].value}\n`;
      }

      return context;

    } catch (e) {
      console.log("Brain Context Error:", e.message);
      return "";
    }
  },

  // ===============================
  // 🧠 CLEAR MEMORY
  // ===============================
  async clear(userId) {
    try {
      const user = db.getUser(userId);

      user.memory = {};

      db.updateUser(userId, user);

      return true;
    } catch (e) {
      console.log("Brain Clear Error:", e.message);
      return false;
    }
  }
};
