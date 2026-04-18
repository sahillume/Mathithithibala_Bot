/**
 * Welcome System - Mathithibala AI Group Manager (PRO VERSION)
 */

const db = require('../../database');

module.exports = {
  name: 'welcome',
  aliases: ['welcomeon', 'welcomeoff', 'setwelcome'],
  category: 'admin',
  desc: 'Enable/disable and manage welcome messages',
  usage: 'welcome on/off | setwelcome <message>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {

      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      // 🧠 SAFE DB LOAD
      let groupSettings;
      try {
        groupSettings = db.getGroupSettings(groupId) || {};
      } catch (e) {
        groupSettings = {};
      }

      // 📌 SHOW STATUS
      if (!action) {
        const status = groupSettings.welcome ? '✅ Enabled' : '❌ Disabled';
        const message = groupSettings.welcomeMessage || 'Welcome to the group!';

        return sock.sendMessage(groupId, {
          text: `╭━━『 👋 *WELCOME SYSTEM* 』━━╮

📊 Status: ${status}
💬 Message: ${message}

━━━━━━━━━━━━━━━━━━
🛠 Commands:
• .welcome on
• .welcome off
• .setwelcome <message>

👑 Mathithibala AI Group Manager
╰━━━━━━━━━━━━━━━━━`
        }, { quoted: msg });
      }

      // 🔥 ENABLE / DISABLE
      if (action === 'on' || action === 'off') {
        const enable = action === 'on';

        try {
          db.updateGroupSettings(groupId, {
            welcome: enable
          });
        } catch (e) {
          return extra.reply('❌ Database error. Cannot update settings.');
        }

        return sock.sendMessage(groupId, {
          text: `╭━━『 👋 *WELCOME UPDATED* 』━━╮

Status: ${enable ? '✅ ENABLED' : '❌ DISABLED'}

${enable
  ? '🎉 New members will now receive welcome messages!'
  : '🚫 Welcome messages have been turned off.'}

👑 Mathithibala AI System
╰━━━━━━━━━━━━━━━━━`
        }, { quoted: msg });
      }

      // ✏️ SET WELCOME MESSAGE
      if (action === 'setwelcome') {
        const customMessage = args.slice(1).join(' ');

        if (!customMessage) {
          return extra.reply('❌ Please provide a welcome message.');
        }

        try {
          db.updateGroupSettings(groupId, {
            welcomeMessage: customMessage
          });
        } catch (e) {
          return extra.reply('❌ Failed to update welcome message.');
        }

        return sock.sendMessage(groupId, {
          text: `╭━━『 ✏️ *WELCOME MESSAGE SET* 』━━╮

💬 New Message:
${customMessage}

👑 Updated by Mathithibala AI
╰━━━━━━━━━━━━━━━━━`
        }, { quoted: msg });
      }

      // ❌ INVALID INPUT
      return extra.reply(`❌ Invalid command.

Usage:
• .welcome on
• .welcome off
• .setwelcome <message>`);

    } catch (error) {
      console.log('Welcome Error:', error);

      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ System Error

Could not update welcome settings.

Please try again later.`
      }, { quoted: msg });
    }
  }
};
