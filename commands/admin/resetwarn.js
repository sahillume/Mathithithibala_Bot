/**
 * Reset Warn Command - Pro Version
 * Mathithibala Admin System
 */

const db = require('../../database');

module.exports = {
  name: 'resetwarn',
  aliases: ['clearwarn', 'rw'],
  category: 'admin',
  description: 'Reset warnings for a user or all users',
  usage: '.resetwarn @user / .resetwarn all',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 🔥 RESET ALL WARNINGS
      if (args[0]?.toLowerCase() === 'all') {
        db.clearAllWarnings(groupId);

        return sock.sendMessage(groupId, {
          text: `🧹 *ALL WARNINGS CLEARED!*\n\n📊 Every user's warnings have been reset.\n\n👑 Action by Admin\n🤖 Mathithibala Bot`
        }, { quoted: msg });
      }

      // 👤 Get mentioned or replied user
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      const replied =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const userId = mentioned || replied;

      if (!userId) {
        return sock.sendMessage(groupId, {
          text:
`⚠️ *Reset Warning System*

📌 Usage:
.resetwarn @user
.resetwarn all

Example:
.resetwarn @Sahil`
        }, { quoted: msg });
      }

      // 🧠 Check current warnings
      const warnings = db.getWarnings(groupId, userId) || 0;

      if (warnings === 0) {
        return sock.sendMessage(groupId, {
          text: `⚠️ This user has no warnings to reset.`,
        }, { quoted: msg });
      }

      // 🧹 Reset warnings
      db.setWarnings(groupId, userId, 0);

      // 📢 Success message
      await sock.sendMessage(groupId, {
        text: `✅ *WARNINGS RESET*\n\n👤 User: @${userId.split('@')[0]}\n📊 Previous Warnings: ${warnings}\n\n👑 Action by Admin\n🤖 Mathithibala Bot`,
        mentions: [userId]
      }, { quoted: msg });

    } catch (error) {
      console.error('ResetWarn Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to reset warnings: ${error.message}`
      }, { quoted: msg });
    }
  }
};
