 /**
  * 🚫 Sahil Pro Anti-Link System
  * Folder: commands/sahilPro.lume/
  * Author: Professor Sahil
  * System: Mathithibala_Bot Security Core
  */

const db = require('../../database');

module.exports = {
  name: 'antilinkpro',
  aliases: ['antilink', 'linkguard'],
  category: 'sahilPro',
  description: 'Advanced anti-link protection system for groups',
  usage: '.antilinkpro (auto system)',

  /**
   * ⚠️ This is an EVENT MODULE, not a user command
   * It runs from handler.js on every message
   */

  async check(sock, msg) {
    try {
      const from = msg.key.remoteJid;

      // Only groups
      if (!from.endsWith('@g.us')) return;

      const groupSettings = db.getGroupSettings(from);
      if (!groupSettings?.antilinkpro) return;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        '';

      if (!body) return;

      // 🔗 LINK DETECTION PATTERN
      const linkRegex =
        /(https?:\/\/|www\.|chat\.whatsapp\.com|bit\.ly|t\.me|discord\.gg)/gi;

      if (!linkRegex.test(body)) return;

      // ===============================
      // 🚫 DELETE MESSAGE (BEST EFFORT)
      // ===============================
      try {
        await sock.sendMessage(from, {
          delete: msg.key
        });
      } catch (e) {}

      // ===============================
      // ⚠️ WARNING MESSAGE
      // ===============================
      const warningMsg =
`🚫 *ANTI-LINK PRO ACTIVE*

👤 User: @${msg.key.participant?.split('@')[0] || 'unknown'}
⚠️ Action: Link detected & removed

📛 Links are not allowed in this group
⚡ System: Sahil Security Engine`;

      await sock.sendMessage(from, {
        text: warningMsg,
        mentions: msg.key.participant ? [msg.key.participant] : []
      });

    } catch (err) {
      console.log("AntiLinkPro Error:", err.message);
    }
  }
};
