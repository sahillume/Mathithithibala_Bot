/**
 * Attps Command - Action / Status Generator
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: "attps",
  aliases: ["action", "statusmsg", "task"],
  category: "general",
  description: "Generates a bot action/status message",
  usage: ".attps <text>",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const text = args.join(" ");

      if (!text) {
        return extra.reply(
          "❌ Please provide a message.\n\nExample:\n.attps system running check"
        );
      }

      const output =
`⚡ *MATHITHIBALA ACTION SYSTEM*

━━━━━━━━━━━━━━
🧠 Task: ${text}

🤖 Status: Processing
⚙️ Engine: Sahil Pro System
👑 Owner: Professor Sahil

━━━━━━━━━━━━━━
✔ Completed via Mathithibala_Bot`;

      await sock.sendMessage(chatId, {
        text: output
      }, { quoted: msg });

    } catch (err) {
      console.log("ATTPS ERROR:", err);
      extra.reply("❌ Command failed to execute.");
    }
  }
};
