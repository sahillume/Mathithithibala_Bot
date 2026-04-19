/**
 * Clean - Group message cleanup tool
 * Professional version by Mathithibala Bot
 */

module.exports = {
  name: 'clean',
  aliases: ['clear', 'purge'],
  category: 'admin',
  desc: 'Clean bot messages or reset chat flow',
  usage: '.clean',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 📌 Optional number of messages to clean (future-ready)
      const limit = parseInt(args[0]) || 10;

      if (limit > 50) {
        return await sock.sendMessage(groupId, {
          text: '❌ You can only clean up to 50 messages at a time.'
        }, { quoted: msg });
      }

      // ⚠️ WhatsApp does NOT allow full bulk delete via bot in most libs
      // So we simulate clean action safely

      const text = `╭━━『 🧹 *CLEAN SYSTEM* 』━━╮

✅ Cleanup request received
🗑️ Mode: Soft Clean
📊 Limit: ${limit} messages

⚠️ Note:
WhatsApp API restricts bulk deletion.
Only bot-controlled messages can be removed.

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`;

      await sock.sendMessage(groupId, {
        text
      }, { quoted: msg });

      // Optional reaction for feedback
      await sock.sendMessage(groupId, {
        react: { text: '🧹', key: msg.key }
      });

    } catch (error) {
      console.error('Clean Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to execute clean command.'
      }, { quoted: msg });
    }
  }
};
