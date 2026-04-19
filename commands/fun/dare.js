/**
 * Dare Command - Fun Game Generator
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const dares = [
  "Send a voice note singing your favorite song 🎤",
  "Text your crush and say 'I miss you' 😏",
  "Do 10 pushups right now 💪",
  "Send your last screenshot 📱",
  "Say something funny in a voice note 😂",
  "Change your WhatsApp status to 'I am crazy' for 10 minutes 🤪",
  "Send a selfie right now 📸",
  "Message someone random 'I love you' ❤️",
  "Act like a baby for 30 seconds 👶",
  "Tell a joke and make everyone laugh 🤡"
];

module.exports = {
  name: "dare",
  aliases: ["d"],
  category: "fun",
  description: "Get a random dare challenge",
  usage: ".dare",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const randomDare =
        dares[Math.floor(Math.random() * dares.length)];

      await sock.sendMessage(chatId, {
        text:
`🎯 *DARE GAME*

━━━━━━━━━━━━━━
🔥 ${randomDare}

👑 Mathithibala_Bot Fun Mode
⚡ Professor Sahil System
━━━━━━━━━━━━━━`
      }, { quoted: msg });

    } catch (err) {
      console.log("DARE ERROR:", err);
      extra.reply("❌ Failed to generate dare.");
    }
  }
};
