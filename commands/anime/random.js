/**
 * Random Anime Image Command
 */

const axios = require("axios");

const endpoints = ["waifu", "neko", "shinobu", "megumin", "bully"];

module.exports = {
  name: "anime",
  aliases: ["randomanime"],
  category: "anime",
  description: "Get random anime image",
  usage: ".anime",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const type = endpoints[Math.floor(Math.random() * endpoints.length)];

      const res = await axios.get(`https://api.waifu.pics/sfw/${type}`);

      await sock.sendMessage(chatId, {
        image: { url: res.data.url },
        caption: `🎌 *Random Anime (${type})*\n\n🤖 Mathithibala_Bot`
      }, { quoted: msg });

    } catch (err) {
      console.log("ANIME RANDOM ERROR:", err);
      extra.reply("❌ Failed to fetch anime image.");
    }
  }
};
