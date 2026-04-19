/**
 * AntiLink - Prevent link spam in groups
 * Professional version by Mathithibala Bot
 */

const db = require('../../database');

module.exports = {
  name: 'antilink',
  aliases: ['linklock', 'nospamlink'],
  category: 'admin',
  desc: 'Enable/disable anti-link protection',
  usage: '.antilink on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      const settings = db.getGroupSettings(groupId);

      // 📊 SHOW STATUS
      if (!action || !['on', 'off'].includes(action)) {
        const status = settings?.antilink ? '🟢 Enabled' : '🔴 Disabled';

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🚫 *ANTI-LINK SYSTEM* 』━━╮

📊 Status: ${status}

📌 Commands:
• .antilink on
• .antilink off

🧠 Blocks:
✔ WhatsApp group links
✔ External URLs
✔ Invite spam

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      const enable = action === 'on';

      db.updateGroupSettings(groupId, {
        antilink: enable
      });

      await sock.sendMessage(groupId, {
        text: `╭━━『 🚫 *ANTI-LINK SYSTEM* 』━━╮

${enable ? '🟢 ENABLED' : '🔴 DISABLED'}

${enable
  ? '🛡️ Links will now be blocked automatically.'
  : '❌ Anti-link protection turned off.'}

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
      }, { quoted: msg });

    } catch (error) {
      console.error('AntiLink Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to update anti-link settings.'
      }, { quoted: msg });
    }
  }
};
