/**
 * 🤖 Sahil Pro AutoBio System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Core Utility
 */

const config = require('../../config');

module.exports = {
  name: 'autobio',
  aliases: ['setbioauto', 'bioauto'],
  category: 'sahilPro',
  description: 'Automatically updates bot WhatsApp bio/status',
  usage: '.autobio (runs system)',

  /**
   * ⚠️ This is NOT a normal command.
   * It runs automatically or via scheduler in index.js
   */

  async run(sock) {
    try {

      const bioText = `🤖 ${config.botName} | 👑 ${config.ownerName} | ⚡ Sahil Pro System`;

      // ===============================
      // 📌 UPDATE STATUS/BIO
      // ===============================
      await sock.updateProfileStatus(bioText);

      console.log("✅ AutoBio updated:", bioText);

      return true;

    } catch (err) {
      console.log("❌ AutoBio Error:", err.message);
      return false;
    }
  }
};
