/**
 * Fire Text Effect (Enhanced Version)
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'fire',
  aliases: ['flame', 'burn'],
  category: 'textmaker',
  description: 'Create high-quality fire text effect',
  usage: '.fire <text>',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    try {
      const text = args.join(' ').trim();

      // Better validation
      if (!text) {
        return await sock.sendMessage(chatId, {
          text:
`🔥 *FIRE TEXT MAKER*

Usage: .fire <text>

Example:
.fire Sahil`
        }, { quoted: msg });
      }

      // Typing indicator (makes bot feel real)
      await sock.sendPresenceUpdate('composing', chatId);

      // Generate image
      const result = await mumaker.ephoto(
        'https://en.ephoto360.com/flame-lettering-effect-372.html',
        text
      );

      if (!result?.image) {
        throw new Error('API returned empty result');
      }

      // Send image with better caption
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption:
`🔥 *FIRE TEXT GENERATED*

📝 Text: ${text}
🤖 Bot: ${config.botName || 'MD Bot'}
⚡ Status: Success`
      }, { quoted: msg });

    } catch (error) {
      console.error('[FIRE COMMAND ERROR]', error);

      await sock.sendMessage(chatId, {
        text:
`❌ *FIRE TEXT FAILED*

Reason: ${error.message || 'Unknown error'}
Try again in a few seconds.`
      }, { quoted: msg });
    }
  }
};
