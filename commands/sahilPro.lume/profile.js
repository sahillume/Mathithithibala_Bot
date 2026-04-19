/**
 * 👤 Sahil Pro Profile System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot User Intelligence Core
 */

const db = require('../../database');

module.exports = {
  name: 'profile',
  aliases: ['me', 'userinfo', 'stats'],
  category: 'sahilPro',
  description: 'Displays user profile information',
  usage: '.profile',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;

      const sender =
        msg.key.participant ||
        msg.key.remoteJid;

      const userId = sender;

      // ===============================
      // 📌 GET USER DATA
      // ===============================
      let user = db.getUser(userId);

      if (!user) {
        user = {
          id: userId,
          messages: 0,
          commands: 0,
          level: 1,
          xp: 0,
          memory: {}
        };
        db.updateUser(userId, user);
      }

      // ===============================
      // 📊 PROFILE OUTPUT
      // ===============================
      const profileText = `
╭━━『 👤 USER PROFILE 』━━╮

🧑 ID: ${userId}
📨 Messages: ${user.messages || 0}
⚙️ Commands Used: ${user.commands || 0}
⭐ Level: ${user.level || 1}
🔥 XP: ${user.xp || 0}

🧠 Memory Items: ${Object.keys(user.memory || {}).length}

╰━━━━━━━━━━━━━━━━━━
🤖 Powered by Sahil Pro System
`;

      return sock.sendMessage(from, {
        text: profileText
      }, { quoted: msg });

    } catch (err) {
      console.log("Profile Error:", err.message);
      return extra.reply("❌ Failed to load profile.");
    }
  }
};
