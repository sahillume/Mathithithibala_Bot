/**
 * Owner Command - Show bot owner info
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: 'owner',
  aliases: ['dev', 'creator', 'sahil'],
  category: 'general',
  description: 'Shows bot owner information',
  usage: '.owner',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      await sock.sendMessage(chatId, {
        text:
`👑 *BOT OWNER INFORMATION*

🤖 Bot Name: Mathithibala_Bot
👨‍🏫 Owner: Professor Sahil
⚡ System: Sahil Pro Engine

📱 Contact:
wa.me/27835515085

💡 Status: Online & Running

━━━━━━━━━━━━━━
🔥 Powered by Sahil Pro System`
      }, { quoted: msg });

    } catch (err) {
      console.log('OWNER ERROR:', err);
      extra.reply('❌ Failed to fetch owner info.');
    }
  }
};
