/**
 * Thunder Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'thunder',
  aliases: [],
  category: 'textmaker',
  description: 'Create thunder text effect',
  usage: '.thunder <text>',

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const text = args.join(' ').trim();

      if (!text) {
        return await sock.sendMessage(
          jid,
          {
            text:
`⚡ *THUNDER TEXT*

Usage:
.thunder Nick

Example:
.thunder Sahil`
          },
          { quoted: msg }
        );
      }

      await sock.sendPresenceUpdate('composing', jid);

      const result = await mumaker.ephoto(
        'https://en.ephoto360.com/thunder-text-effect-online-97.html',
        text
      );

      if (!result?.image) {
        return await sock.sendMessage(jid, {
          text: '❌ Failed to generate thunder text. Try again later.'
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        image: { url: result.image },
        caption:
`⚡ *THUNDER TEXT GENERATED*

📝 Text: ${text}
🤖 Bot: ${config.botName}`
      }, { quoted: msg });

    } catch (error) {
      console.error('Thunder error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Error generating thunder text. Please try again later.'
      }, { quoted: msg });
    }
  }
};
