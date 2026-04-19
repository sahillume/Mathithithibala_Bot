/**
 * Waifu Command - Random Anime Waifu
 */

const axios = require("axios");

module.exports = {
  name: "waifu",
  aliases: ["waifupic"],
  category: "anime",
  description: "Get a random anime waifu image",
  usage: ".waifu",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const res = await axios.get("https://api.waifu.pics/sfw/waifu");

      await sock.sendMessage(chatId, {
        image: { url: res.data.url },
        caption: "🌸 *Your Waifu*\n\n🤖 Mathithibala_Bot"
      }, { quoted: msg });

    } catch (err) {
      console.log("WAIFU ERROR:", err);
      extra.reply("❌ Failed to fetch waifu.");
    }
  }
};
