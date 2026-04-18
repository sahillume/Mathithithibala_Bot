/**
 * Snow Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'snow',
  aliases: [],
  category: 'textmaker',
  description: 'Create snow text effect',
  usage: '.snow <text>',

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;
      const text = args.join(' ').trim();

      if (!text) {
        return await sock.sendMessage(
          jid,
          {
            text:
`❄️ *SNOW TEXT*

Usage:
.snow Nick

Example:
.snow Sahil`
          },
          { quoted: msg }
        );
      }

      await sock.sendPresenceUpdate('composing', jid);

      const result = await mumaker.ephoto(
        'https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html',
        text
      );

      if (!result?.image) {
        return await sock.sendMessage(jid, {
          text: '❌ Failed to generate snow text. Try again later.'
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        image: { url: result.image },
        caption:
`❄️ *SNOW TEXT GENERATED*

📝 Text: ${text}
🤖 Bot: ${config.botName}`
      }, { quoted: msg });

    } catch (error) {
      console.error('Snow error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Error generating snow text. Please try again later.'
      }, { quoted: msg });
    }
  }
};
