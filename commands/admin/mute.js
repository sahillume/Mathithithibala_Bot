/**
 * Mute Command - Pro Version (With Timer)
 * Mathithibala Admin System
 */

const db = require('../../database');

function parseTime(input) {
  if (!input) return null;

  const match = input.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

module.exports = {
  name: 'mute',
  aliases: ['silence'],
  category: 'admin',
  description: 'Mute a user',
  usage: '.mute @user 10m',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 👤 Get target
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      const replied =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const userId = mentioned || replied;

      if (!userId) {
        return sock.sendMessage(groupId, {
          text: `❌ Please mention or reply to a user to mute.\n\nExample:\n.mute @user 10m`
        }, { quoted: msg });
      }

      // ⛔ Prevent double mute
      if (db.isMuted(groupId, userId)) {
        return sock.sendMessage(groupId, {
          text: `⚠️ This user is already muted.`
        }, { quoted: msg });
      }

      // ⏳ Parse time
      const timeArg = args.find(a => /^\d+(s|m|h|d)$/.test(a));
      const duration = parseTime(timeArg);

      // 🔒 Save mute
      db.setMute(groupId, userId, true);

      // 📢 Notify
      await sock.sendMessage(groupId, {
        text: `🔇 *USER MUTED*\n\n👤 @${userId.split('@')[0]}\n⏳ Duration: ${timeArg || 'Unlimited'}\n\n🤖 Mathithibala Bot`,
        mentions: [userId]
      }, { quoted: msg });

      // ⏳ Auto unmute
      if (duration) {
        setTimeout(async () => {
          try {
            db.setMute(groupId, userId, false);

            await sock.sendMessage(groupId, {
              text: `🔊 *AUTO UNMUTE*\n\n👤 @${userId.split('@')[0]} is now unmuted.`,
              mentions: [userId]
            });
          } catch (e) {
            console.error('Auto Unmute Error:', e);
          }
        }, duration);
      }

    } catch (error) {
      console.error('Mute Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to mute user: ${error.message}`
      }, { quoted: msg });
    }
  }
};
