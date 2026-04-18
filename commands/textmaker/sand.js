/**
 * Sand Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'sand',
  aliases: [],
  category: 'textmaker',
  description: 'Create sand text effect',
  usage: '.sand <text>',

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;
      const text = args.join(' ').trim();

      if (!text) {
        return await sock.sendMessage(
          chatId,
          {
            text:
`🏖️ *SAND TEXT*

Usage:
.sand Nick

Example:
.sand Sahil`
          },
          { quoted: msg }
        );
      }

      await sock.sendPresenceUpdate('composing', chatId);

      const result = await mumaker.ephoto(
        'https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html',
        text
      );

      if (!result?.image) {
        return await sock.sendMessage(chatId, {
          text: '❌ Failed to generate sand text. Try again later.'
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption:
`🏖️ *SAND TEXT GENERATED*

📝 Text: ${text}
🤖 Bot: ${config.botName}`
      }, { quoted: msg });

    } catch (error) {
      console.error('Sand error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Error generating sand text.'
      }, { quoted: msg });
    }
  }
};
