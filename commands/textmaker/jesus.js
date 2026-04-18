/**
 * Jesus Text Effect (Enhanced Version)
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'jesus',
  aliases: ['godtext', 'holy'],
  category: 'textmaker',
  description: 'Create holy Jesus-style text effect',
  usage: '.jesus <text>',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    try {
      const text = args.join(' ').trim();

      if (!text) {
        return await sock.sendMessage(chatId, {
          text:
`✝️ *JESUS TEXT GENERATOR*

Usage: .jesus <text>

Example:
.jesus Sahil`
        }, { quoted: msg });
      }

      // Show typing indicator
      await sock.sendPresenceUpdate('composing', chatId);

      const result = await mumaker.ephoto(
        'https://en.ephoto360.com/1917-style-text-effect-523.html',
        text
      );

      if (!result?.image) {
        throw new Error('Failed to generate Jesus text effect');
      }

      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption:
`✝️ *HOLY TEXT GENERATED*

📝 Text: ${text}
🙏 Type: Jesus Effect
🤖 Bot: ${config.botName || 'MD Bot'}`
      }, { quoted: msg });

    } catch (error) {
      console.error('[JESUS COMMAND ERROR]', error);

      await sock.sendMessage(chatId, {
        text:
`❌ *JESUS EFFECT FAILED*

Reason: ${error.message || 'Unknown error'}
Please try again later.`
      }, { quoted: msg });
    }
  }
};
