/**
 * 👤🔍 Sahil Pro Profile Inspector
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Safe Intelligence Layer
 *
 * NOTE:
 * This module only reads bot database info.
 * It does NOT track WhatsApp users or private activity.
 */

const db = require('../../database');

module.exports = {
  name: 'profilestalker',
  aliases: ['inspect', 'profileview', 'checkuser'],
  category: 'sahilPro',
  description: 'Inspect stored user profile data (safe DB-based)',
  usage: '.profilestalker <tag/reply>',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;

      // ===============================
      // 👤 GET TARGET USER
      // ===============================
      const target =
        msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!target) {
        return extra.reply(
`╭━━『 👤 Profile Inspector 』━━╮

📌 Usage:
- Reply to a user message
- OR mention a user

⚠️ Only bot-stored data is shown

╰━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📊 LOAD USER DATA
      // ===============================
      let user = db.getUser(target);

      if (!user) {
        return extra.reply(
`❌ No data found for this user in database.`
        );
      }

      // ===============================
      // 📄 FORMAT PROFILE
      // ===============================
      const text = `
╭━━『 👤 PROFILE INSPECTOR 』━━╮

🧑 User: ${target}

📨 Messages: ${user.messages || 0}
⚙️ Commands: ${user.commands || 0}
⭐ Level: ${user.level || 1}
🔥 XP: ${user.xp || 0}

🧠 Memory Keys: ${(user.memory ? Object.keys(user.memory).length : 0)}

⏱ Last Seen (bot-based): ${user.lastSeen || "Unknown"}

╰━━━━━━━━━━━━━━
🤖 Sahil Pro Safe Inspector
`;

      return sock.sendMessage(from, {
        text
      }, { quoted: msg });

    } catch (err) {
      console.log("Profile Inspector Error:", err.message);
      return extra.reply("❌ Error loading profile.");
    }
  }
};
