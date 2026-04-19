/**
 * Bot Link Command - Source / Repository Info
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: "botlink",
  aliases: ["repo", "source", "gitlink"],
  category: "general",
  description: "Shows bot GitHub repository link",
  usage: ".botlink",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const repoUrl = "https://github.com/sahillume/Mathithithibala_Bot.git";

      await sock.sendMessage(chatId, {
        text:
`🔗 *BOT SOURCE LINK*

📁 Repository:
${repoUrl}

👑 Owner: Professor Sahil
🤖 Bot: Mathithibala_Bot

━━━━━━━━━━━━━━
⚡ Powered by Sahil Pro System`
      }, { quoted: msg });

    } catch (err) {
      console.log("BOTLINK ERROR:", err);
      extra.reply("❌ Failed to fetch bot link.");
    }
  }
};
