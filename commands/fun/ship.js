/**
 * Ship Command - Love Calculator
 * Mathithibala_Bot Pro | Professor Sahil System
 */

function getLovePercentage(a, b) {
  // Simple consistent random based on names
  const str = a + b;
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash % 101); // 0 - 100
}

function getStatus(percent) {
  if (percent > 90) return "💍 Perfect Match!";
  if (percent > 75) return "😍 Strong Love!";
  if (percent > 50) return "😊 Good Connection!";
  if (percent > 30) return "😅 Could Work...";
  return "💔 Not Compatible!";
}

module.exports = {
  name: "ship",
  aliases: ["love", "match"],
  category: "fun",
  description: "Check love compatibility between two users",
  usage: ".ship @user1 @user2",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const mentions =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length < 2) {
        return extra.reply(
          "❌ Tag two people.\n\nExample:\n.ship @user1 @user2"
        );
      }

      const user1 = mentions[0];
      const user2 = mentions[1];

      const percent = getLovePercentage(user1, user2);
      const status = getStatus(percent);

      const bar = "█".repeat(Math.floor(percent / 10)) +
                  "░".repeat(10 - Math.floor(percent / 10));

      await sock.sendMessage(chatId, {
        text:
`❤️ *LOVE CALCULATOR*

👤 @${user1.split("@")[0]}
💞
👤 @${user2.split("@")[0]}

━━━━━━━━━━━━━━
💖 Match: *${percent}%*
[${bar}]

💬 Status: ${status}

━━━━━━━━━━━━━━
🤖 Mathithibala_Bot`,
        mentions: [user1, user2]
      }, { quoted: msg });

    } catch (err) {
      console.log("SHIP ERROR:", err);
      extra.reply("❌ Failed to calculate love.");
    }
  }
};
