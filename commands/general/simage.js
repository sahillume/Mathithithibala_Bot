/**
 * SIMAGE Command - Image Search Tool
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const axios = require('axios');

module.exports = {
  name: 'simage',
  aliases: ['img', 'image', 'googleimg'],
  category: 'general',
  description: 'Search images from internet',
  usage: '.simage <query>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;
      const query = args.join(' ');

      if (!query) {
        return extra.reply(
          `❌ Please provide a search term.\n\nExample:\n.simage cats`
        );
      }

      await extra.reply('🖼️ Searching images... please wait');

      // Unsplash fallback API (stable free image source)
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=DEMO_KEY`;

      // NOTE: Replace DEMO_KEY with your own Unsplash API key for full power
      const res = await axios.get(url).catch(() => null);

      let image;

      if (res?.data?.results?.length) {
        image = res.data.results[0].urls.regular;
      } else {
        // fallback image
        image = `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`;
      }

      await sock.sendMessage(chatId, {
        image: { url: image },
        caption:
`🖼️ *Image Search Result*

🔎 Query: ${query}

🤖 Powered by Mathithibala_Bot Pro
👑 Professor Sahil System`
      }, { quoted: msg });

    } catch (err) {
      console.log('SIMAGE Error:', err);
      extra.reply('❌ Image search failed.');
    }
  }
};
