/**
 * Neko Command - Anime Cat Girl
 */

const axios = require("axios");

module.exports = {
  name: "neko",
  aliases: ["catgirl"],
  category: "anime",
  description: "Get a random neko image",
  usage: ".neko",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const res = await axios.get("https://api.waifu.pics/sfw/neko");

      await sock.sendMessage(chatId, {
        image: { url: res.data.url },
        caption: "🐱 *Neko Mode Activated*\n\n🤖 Mathithibala_Bot"
      }, { quoted: msg });

    } catch (err) {
      console.log("NEKO ERROR:", err);
      extra.reply("❌ Failed to fetch neko.");
    }
  }
};
