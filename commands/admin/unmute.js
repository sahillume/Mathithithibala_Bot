/**
 * Unmute Command - Pro Version
 * Mathithibala Bot Admin System
 */

const db = require('../../database');

module.exports = {
  name: 'unmute',
  aliases: ['unmuteuser'],
  category: 'admin',
  description: 'Unmute a user in the group',
  usage: '.unmute @user',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 👤 Get mentioned or replied user
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      const replied =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const userId = mentioned || replied;

      if (!userId) {
        return sock.sendMessage(groupId, {
          text: `❌ Please mention or reply to a user to unmute.\n\nExample:\n.unmute @user`
        }, { quoted: msg });
      }

      // 🧠 Check if user is muted
      const isMuted = db.isMuted(groupId, userId);

      if (!isMuted) {
        return sock.sendMessage(groupId, {
          text: `⚠️ This user is not muted.`,
        }, { quoted: msg });
      }

      // 🔓 Remove mute
      db.setMute(groupId, userId, false);

      // 📢 Success message
      await sock.sendMessage(groupId, {
        text: `🔊 *USER UNMUTED*\n\n👤 User: @${userId.split('@')[0]}\n\n👑 Action by Admin\n🤖 Mathithibala Bot`,
        mentions: [userId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Unmute Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to unmute user: ${error.message}`
      }, { quoted: msg });
    }
  }
};
