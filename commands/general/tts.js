/**
 * TTS Command - Text to Speech (Mathithibala Pro System)
 * Powered by Professor Sahil
 */

const axios = require('axios');

module.exports = {
  name: 'tts',
  aliases: ['texttospeech', 'say', 'voice'],
  category: 'general',
  description: 'Convert text into voice message',
  usage: '.tts <text>',

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: `❌ Please provide text to convert into speech.\n\nExample: .tts hello my friend`
        }, { quoted: msg });
      }

      // 🔊 Processing message
      await sock.sendMessage(chatId, {
        text: `🎤 *Mathithibala TTS Engine*\n\n🔄 Converting text to voice...\n⏳ Please wait`
      }, { quoted: msg });

      // 🌐 Google TTS API (stable free endpoint)
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

      const res = await axios.get(ttsUrl, {
        responseType: 'arraybuffer'
      });

      const audioBuffer = Buffer.from(res.data);

      // 🎧 Send voice note
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: msg });

      // 🧠 Final confirmation
      await sock.sendMessage(chatId, {
        text: `✅ *TTS Generated Successfully*\n\n🤖 Powered by Mathithibala_Bot Pro\n👨‍🏫 Professor Sahil System`
      });

    } catch (err) {
      console.error('TTS Error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ TTS failed. Please try again later.'
      }, { quoted: msg });
    }
  }
};
