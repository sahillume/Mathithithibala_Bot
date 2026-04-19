/**
 * AutoSticker - Convert images/videos to stickers automatically
 * Professional version by Mathithibala Bot
 */

const db = require('../../database');
const config = require('../../config');

module.exports = {
  name: 'autosticker',
  aliases: ['as', 'stickermode', 'stickerauto'],
  category: 'admin',
  desc: 'Enable/disable auto sticker in group',
  usage: '.autosticker on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      const settings = db.getGroupSettings(groupId);

      // 📌 SHOW STATUS
      if (!action || !['on', 'off'].includes(action)) {
        const status = settings?.autosticker
          ? '🟢 Enabled'
          : '🔴 Disabled';

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🧩 *AUTO STICKER* 』━━╮

📊 Status: ${status}

📌 Commands:
• .autosticker on
• .autosticker off

🧠 When enabled:
✔ Images → Stickers
✔ Videos → Stickers (short clips)

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      const enable = action === 'on';

      db.updateGroupSettings(groupId, {
        autosticker: enable
      });

      await sock.sendMessage(groupId, {
        text: `╭━━『 🧩 *AUTO STICKER* 』━━╮

${enable ? '🟢 Auto Sticker ENABLED' : '🔴 Auto Sticker DISABLED'}

${enable
  ? '📸 Images and short videos will now become stickers automatically.'
  : '❌ Sticker auto-conversion turned off.'}

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
      }, { quoted: msg });

    } catch (error) {
      console.error('AutoSticker Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to update auto-sticker settings.'
      }, { quoted: msg });
    }
  }
};
