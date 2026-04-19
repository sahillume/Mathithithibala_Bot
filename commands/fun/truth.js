/**
 * Truth Command - Fun Game Generator
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const truths = [
  "What is your biggest secret?",
  "Who was your first crush?",
  "What is the most embarrassing thing you’ve done?",
  "Have you ever lied to your best friend?",
  "What is something you are afraid to tell your parents?",
  "What is your biggest regret?",
  "Have you ever cheated in school?",
  "What is one thing you would change about yourself?",
  "Who do you trust the most?",
  "What is your hidden talent?"
];

module.exports = {
  name: "truth",
  aliases: ["t", "honesty"],
  category: "fun",
  description: "Sends a random truth question",
  usage: ".truth",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const randomTruth =
        truths[Math.floor(Math.random() * truths.length)];

      await sock.sendMessage(chatId, {
        text:
`🎭 *TRUTH GAME*

━━━━━━━━━━━━━━
❓ ${randomTruth}

👑 Mathithibala_Bot Fun Mode
⚡ Professor Sahil System
━━━━━━━━━━━━━━`
      }, { quoted: msg });

    } catch (err) {
      console.log("TRUTH ERROR:", err);
      extra.reply("❌ Failed to generate truth question.");
    }
  }
};
