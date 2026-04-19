/**
 * Translate Command - Multi Language Translator
 * Mathithibala_Bot | Sahil Pro Build
 */

const axios = require('axios');

module.exports = {
  name: 'translate',
  aliases: ['tr', 'lang'],
  category: 'general',
  description: 'Translate text to another language',
  usage: '.translate <lang code> <text>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const lang = args[0];
      const text = args.slice(1).join(' ');

      if (!lang || !text) {
        return extra.reply(
`🌍 Usage:
.translate <language code> <text>

Example:
.translate es Hello world`
        );
      }

      await extra.reply('🌍 Translating...');

      const res = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`
      );

      const translated = res.data?.responseData?.translatedText;

      if (!translated) {
        return extra.reply('❌ Translation failed.');
      }

      await sock.sendMessage(chatId, {
        text:
`🌍 *Translation Result*

📥 Original:
${text}

📤 Translated (${lang}):
${translated}

🤖 Mathithibala_Bot Pro`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      extra.reply('❌ Error while translating.');
    }
  }
};
