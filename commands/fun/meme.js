/**
 * Meme Command - Fetch random memes (Pro Version)
 * Developed for Mathithibala_Bot by Professor Sahil
 */

const axios = require('axios');

module.exports = {
  name: 'meme',
  aliases: ['memes', 'funmeme'],
  category: 'fun',
  description: 'Get a random meme from the internet',
  usage: '.meme',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;

      // ⏳ Loading message
      await sock.sendMessage(chatId, {
        text: '😂 Fetching a fresh meme for you...'
      }, { quoted: msg });

      // 🔥 Meme API (fast + reliable)
      const res = await axios.get('https://meme-api.com/gimme');

      const meme = res.data;

      if (!meme || !meme.url) {
        throw new Error('No meme found');
      }

      // 🖼️ Send meme
      await sock.sendMessage(chatId, {
        image: { url: meme.url },
        caption: `😂 *${meme.title}*\n\n👍 ${meme.ups} upvotes\n📂 r/${meme.subreddit}\n\n🤖 Powered by Mathithibala_Bot Pro`
      }, { quoted: msg });

    } catch (err) {
      console.error('Meme command error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to fetch meme. Try again later.'
      }, { quoted: msg });
    }
  }
};
