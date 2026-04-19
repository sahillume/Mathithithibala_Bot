/**
 * MyActivity Command - User Bot Activity Tracker
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const db = require('../../database');

module.exports = {
  name: 'myactivity',
  aliases: ['activity', 'me', 'profile'],
  category: 'general',
  description: 'Check your bot activity stats',
  usage: '.myactivity',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      // Get user stats from DB (if not exist, fallback to defaults)
      let data;
      try {
        data = db.getUserStats(sender) || {};
      } catch (e) {
        data = {};
      }

      const commandsUsed = data.commandsUsed || 0;
      const messagesSeen = data.messagesSeen || 0;
      const level = data.level || 1;
      const xp = data.xp || 0;

      await sock.sendMessage(chatId, {
        text:
`📊 *YOUR ACTIVITY REPORT*

👤 User: @${sender.split('@')[0]}

━━━━━━━━━━━━━━
⚡ Commands Used: ${commandsUsed}
💬 Messages Seen: ${messagesSeen}
🎯 Level: ${level}
✨ XP: ${xp}

━━━━━━━━━━━━━━
🤖 Bot: Mathithibala_Bot
👑 System: Sahil Pro Engine`
      }, {
        quoted: msg,
        mentions: [sender]
      });

    } catch (err) {
      console.log('MYACTIVITY ERROR:', err);
      extra.reply('❌ Could not load your activity.');
    }
  }
};
