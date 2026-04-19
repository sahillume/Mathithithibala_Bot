/**
 * AntiGroupMention - Prevent mass mention spam
 * Professional version by Mathithibala Bot
 */

const db = require('../../database');

module.exports = {
  name: 'antigroupmention',
  aliases: ['antimentiongroup', 'agm'],
  category: 'admin',
  desc: 'Enable/disable anti-group mention protection',
  usage: '.antigroupmention on/off',
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
        const status = settings?.antigroupmention ? '🟢 Enabled' : '🔴 Disabled';

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🚫 *ANTI GROUP MENTION* 』━━╮

📊 Status: ${status}

📌 Commands:
• .antigroupmention on
• .antigroupmention off

🧠 Protects against:
✔ Mass tagging members
✔ @everyone style spam
✔ Mention flooding

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      const enable = action === 'on';

      db.updateGroupSettings(groupId, {
        antigroupmention: enable
      });

      await sock.sendMessage(groupId, {
        text: `╭━━『 🚫 *ANTI GROUP MENTION* 』━━╮

${enable ? '🟢 ENABLED' : '🔴 DISABLED'}

${enable
  ? '🛡️ Group mention spam will now be blocked automatically.'
  : '❌ Anti-group mention protection turned off.'}

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
      }, { quoted: msg });

    } catch (error) {
      console.error('AntiGroupMention Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to update anti-group-mention settings.'
      }, { quoted: msg });
    }
  }
};
