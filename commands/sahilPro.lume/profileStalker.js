/**
 * 👤🔍 Mathithibala_Bot Profile Inspector (PRO FIXED)
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Safe DB Intelligence Layer
 */

const db = require('../../database');

module.exports = {
  name: 'profilestalker',
  aliases: ['inspect', 'profileview', 'checkuser'],
  category: 'sahilPro',
  description: 'Inspect stored user profile data (safe DB-based)',
  usage: '.profilestalker <reply/mention>',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;

      // ===============================
      // 👤 TARGET DETECTION (FIXED)
      // ===============================
      const context = msg.message?.extendedTextMessage?.contextInfo;

      const target =
        context?.participant ||
        context?.mentionedJid?.[0] ||
        null;

      if (!target) {
        return extra.reply(
`╭━━『 👤 Profile Inspector 』━━╮

📌 How to use:
• Reply to a user message
• OR mention a user

⚠️ Only bot database data is shown
🔐 No WhatsApp tracking involved

╰━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📊 LOAD USER DATA (SAFE FIX)
      // ===============================
      let user = db.getUser(target);

      // Ensure object always exists
      if (!user) {
        user = {
          messages: 0,
          commands: 0,
          level: 1,
          xp: 0,
          memory: {},
          lastSeen: "Unknown"
        };
      }

      // ===============================
      // 🧠 SAFE VALUES
      // ===============================
      const messages = user.messages || 0;
      const commands = user.commands || 0;
      const level = user.level || 1;
      const xp = user.xp || 0;
      const memoryCount = user.memory ? Object.keys(user.memory).length : 0;
      const lastSeen = user.lastSeen || "Unknown";

      // ===============================
      // 📄 PROFILE OUTPUT
      // ===============================
      const text =
`╭━━『 👤 PROFILE INSPECTOR 』━━╮

🧑 User:
➜ ${target}

📊 Stats:
• Messages: ${messages}
• Commands: ${commands}
• Level: ${level}
• XP: ${xp}

🧠 Memory:
• Keys Stored: ${memoryCount}

⏱ Last Seen:
• ${lastSeen}

╰━━━━━━━━━━━━━━
🤖 Mathithibala_Bot Safe Inspector`;

      // ===============================
      // 📩 SEND RESULT
      // ===============================
      return sock.sendMessage(from, {
        text
      }, { quoted: msg });

    } catch (err) {
      console.log('❌ Profile Inspector Error:', err.message);

      return extra.reply(
`❌ Failed to load profile data

⚠️ System error occurred`
      );
    }
  }
};
