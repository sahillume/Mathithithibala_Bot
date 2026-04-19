/**
 * AntiTag - Prevent spam tagging / mention abuse
 * Professional version by Mathithibala Bot
 */

const db = require('../../database');

module.exports = {
  name: 'antitag',
  aliases: ['antilinktag', 'antimention'],
  category: 'admin',
  desc: 'Enable/disable anti-tag protection',
  usage: '.antitag on/off',
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
        const status = settings?.antitag ? '🟢 Enabled' : '🔴 Disabled';

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🚫 *ANTI-TAG SYSTEM* 』━━╮

📊 Status: ${status}

📌 Commands:
• .antitag on
• .antitag off

🧠 Protects against:
✔ Mass mentions
✔ Spam tagging
✔ @everyone abuse

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      const enable = action === 'on';

      db.updateGroupSettings(groupId, {
        antitag: enable
      });

      await sock.sendMessage(groupId, {
        text: `╭━━『 🚫 *ANTI-TAG SYSTEM* 』━━╮

${enable ? '🟢 ENABLED' : '🔴 DISABLED'}

${enable
  ? '🛡️ Users will be blocked from spam tagging members.'
  : '❌ Anti-tag protection turned off.'}

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
      }, { quoted: msg });

    } catch (error) {
      console.error('AntiTag Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to update anti-tag settings.'
      }, { quoted: msg });
    }
  }
};
