/**
 * Pies Command - Random Percentage Generator
 * Mathithibala_Bot Pro | Professor Sahil System
 */

function generatePercent(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 101);
}

function progressBar(percent) {
  const filled = Math.floor(percent / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

module.exports = {
  name: "pies",
  aliases: ["percent", "rate", "howmuch"],
  category: "fun",
  description: "Get a random percentage for anything",
  usage: ".pies <text or @user>",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const text = args.join(" ");

      const mentions =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      let target;

      if (mentions.length > 0) {
        target = mentions[0];
      } else if (text) {
        target = text;
      } else {
        target = extra.sender;
      }

      const percent = generatePercent(target);
      const bar = progressBar(percent);

      await sock.sendMessage(chatId, {
        text:
`🥧 *PERCENTAGE ANALYZER*

━━━━━━━━━━━━━━
🎯 Target: ${
  target.includes("@")
    ? "@" + target.split("@")[0]
    : target
}

📊 Result: *${percent}%*
[${bar}]

🤖 Mathithibala_Bot
👑 Professor Sahil
━━━━━━━━━━━━━━`,
        mentions: target.includes("@") ? [target] : []
      }, { quoted: msg });

    } catch (err) {
      console.log("PIES ERROR:", err);
      extra.reply("❌ Failed to generate percentage.");
    }
  }
};
