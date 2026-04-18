/**
 * ChatGPT Text Effect (Premium Version)
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'chatgpt',
  aliases: ['gpttext', 'aiart', 'openai'],
  category: 'textmaker',
  description: 'Create ChatGPT-style glowing text effect',
  usage: '.chatgpt <text>',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    try {
      const text = args.join(' ').trim();

      if (!text) {
        return await sock.sendMessage(chatId, {
          text:
`🤖 *CHATGPT TEXT EFFECT*

Usage: .chatgpt <text>

Example:
.chatgpt Hello World`
        }, { quoted: msg });
      }

      // typing indicator
      await sock.sendPresenceUpdate('composing', chatId);

      const result = await mumaker.ephoto(
        'https://en.ephoto360.com/create-3d-ai-text-effect-online-1050.html',
        text
      );

      if (!result?.image) {
        throw new Error('Failed to generate ChatGPT text effect');
      }

      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption:
`🤖 *CHATGPT TEXT EFFECT*

📝 Text: ${text}
⚡ Style: AI Generated
✨ Engine: Ephoto360
🤖 Bot: ${config.botName || 'ChatGPT Bot'}`
      }, { quoted: msg });

    } catch (error) {
      console.error('[CHATGPT TEXT ERROR]', error);

      await sock.sendMessage(chatId, {
        text:
`❌ *CHATGPT EFFECT FAILED*

Reason: ${error.message || 'Unknown error'}
Try again later.`
      }, { quoted: msg });
    }
  }
};
