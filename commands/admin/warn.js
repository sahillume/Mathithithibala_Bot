/**
 * Warn System - Pro Version
 * Mathithibala Bot Admin Tool
 */

const db = require('../../database');
const config = require('../../config');

const MAX_WARNINGS = 3; // change if you want stricter system

module.exports = {
  name: 'warn',
  aliases: ['warning'],
  category: 'admin',
  description: 'Warn a user in group',
  usage: '.warn @user reason',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      if (!args[0]) {
        return sock.sendMessage(groupId, {
          text: `⚠️ *Warn System*\n\nUsage:\n.warn @user reason\n\nExample:\n.warn @Sahil spam messages`
        }, { quoted: msg });
      }

      // 👤 Get mentioned user OR replied user
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      const replied =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const userId = mentioned || replied;

      if (!userId) {
        return sock.sendMessage(groupId, {
          text: `❌ Please mention or reply to a user to warn them.`
        }, { quoted: msg });
      }

      // 🚫 Prevent self-warn
      if (userId === msg.key.participant) {
        return sock.sendMessage(groupId, {
          text: `⚠️ You cannot warn yourself.`
        }, { quoted: msg });
      }

      // 📌 Reason
      const reason = args.slice(1).join(' ') || 'No reason provided';

      // 🧠 Get current warnings
      let warnings = db.getWarnings(groupId, userId) || 0;
      warnings++;

      db.setWarnings(groupId, userId, warnings);

      // 👑 Auto kick if limit reached
      if (warnings >= MAX_WARNINGS) {
        await sock.sendMessage(groupId, {
          text: `🚨 *FINAL WARNING REACHED!*\n\n@${userId.split('@')[0]} has been removed for exceeding warnings.`,
          mentions: [userId]
        }, { quoted: msg });

        await sock.groupParticipantsUpdate(groupId, [userId], 'remove');

        db.setWarnings(groupId, userId, 0);
        return;
      }

      // 📢 Warning message
      await sock.sendMessage(groupId, {
        text: `⚠️ *USER WARNED*\n\n👤 User: @${userId.split('@')[0]}\n📌 Reason: ${reason}\n📊 Warning: ${warnings}/${MAX_WARNINGS}\n\n👑 Warned by: Admin\n🤖 Mathithibala Bot System`,
        mentions: [userId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Warn Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error while issuing warning: ${error.message}`
      }, { quoted: msg });
    }
  }
};
