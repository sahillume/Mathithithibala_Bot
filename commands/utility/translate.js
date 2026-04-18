/**
 * Translate Command - Multi-language support (including isiZulu etc.)
 */

const fetch = require('node-fetch');

// Language name → code mapping (important for isiZulu etc.)
const langMap = {
  english: 'en',
  french: 'fr',
  spanish: 'es',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  russian: 'ru',
  japanese: 'ja',
  korean: 'ko',
  chinese: 'zh',
  arabic: 'ar',
  hindi: 'hi',

  // 🇿🇦 South African languages
  zulu: 'zu',
  isizulu: 'zu',
  xhosa: 'xh',
  isixhosa: 'xh',
  afrikaans: 'af',
  sotho: 'st',
  sesotho: 'st',
  tswana: 'tn',
  venda: 've',
  tsonga: 'ts',

  auto: 'auto'
};

module.exports = {
  name: 'translate',
  aliases: ['trt', 'tr'],
  category: 'utility',
  description: 'Translate text to any language (supports isiZulu etc.)',
  usage: '.translate <text> <lang> OR reply + .translate <lang>',

  async execute(sock, msg, args) {
    try {
      const jid = msg.key.remoteJid;

      await sock.sendPresenceUpdate('composing', jid);

      let text = '';
      let langInput = '';

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // 📌 If replying to message
      if (quoted) {
        text =
          quoted.conversation ||
          quoted.extendedTextMessage?.text ||
          quoted.imageMessage?.caption ||
          quoted.videoMessage?.caption ||
          '';

        langInput = args.join(' ').toLowerCase().trim();
      } else {
        // 📌 Direct command
        if (args.length < 2) {
          return await sock.sendMessage(
            jid,
            {
              text:
`🌍 *TRANSLATOR*

Usage:
• .translate hello zulu
• .tr hello isizulu
• Reply to message + .translate french

Supported:
✔ isiZulu (zulu / isizulu)
✔ isiXhosa
✔ Afrikaans
✔ English + more`
            },
            { quoted: msg }
          );
        }

        langInput = args.pop().toLowerCase();
        text = args.join(' ');
      }

      if (!text) {
        return sock.sendMessage(jid, {
          text: '❌ No text found to translate.'
        }, { quoted: msg });
      }

      if (!langInput) {
        return sock.sendMessage(jid, {
          text: '❌ Please specify a language (e.g. zulu, english, french).'
        }, { quoted: msg });
      }

      // Convert language name → code
      const lang = langMap[langInput] || langInput;

      // 🌐 Google Translate API (most reliable free one)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;

      const res = await fetch(url);
      const data = await res.json();

      const translated =
        data?.[0]?.map(x => x?.[0]).join('') || null;

      if (!translated) {
        return sock.sendMessage(jid, {
          text: '❌ Translation failed. Try again.'
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text:
`🌍 *TRANSLATION*

📝 Original:
${text}

🔁 Translated (${langInput}):
${translated}`
      }, { quoted: msg });

    } catch (err) {
      console.error('Translate error:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Translation error occurred.'
      }, { quoted: msg });
    }
  }
};
