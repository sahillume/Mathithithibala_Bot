/**
 * Joke Command - Random Joke Generator
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const axios = require("axios");

module.exports = {
  name: "joke",
  aliases: ["funny", "lol"],
  category: "fun",
  description: "Get a random joke",
  usage: ".joke",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      await extra.reply("😂 Loading a joke...");

      const res = await axios.get("https://official-joke-api.appspot.com/random_joke");

      const joke = res.data;

      if (!joke || !joke.setup) {
        throw new Error("No joke");
      }

      const text =
`😂 *JOKE TIME*

━━━━━━━━━━━━━━
${joke.setup}

🤣 ${joke.punchline}

━━━━━━━━━━━━━━
🤖 Mathithibala_Bot`;

      await sock.sendMessage(chatId, { text }, { quoted: msg });

    } catch (err) {
      console.log("JOKE ERROR:", err);
      extra.reply("❌ Failed to fetch joke.");
    }
  }
};
