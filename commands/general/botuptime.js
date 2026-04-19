/**
 * Bot Uptime Command - System Runtime Tracker
 * Mathithibala_Bot Pro | Professor Sahil System
 */

// Store start time when file loads
const startTime = Date.now();

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  name: "botuptime",
  aliases: ["uptime", "runtime", "alive"],
  category: "general",
  description: "Shows bot uptime",
  usage: ".uptime",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const uptime = Date.now() - startTime;

      await sock.sendMessage(chatId, {
        text:
`⏱️ *BOT UPTIME STATUS*

━━━━━━━━━━━━━━
🤖 Bot: Mathithibala_Bot
👑 Owner: Professor Sahil

⏳ Uptime: ${formatTime(uptime)}

⚡ Status: Online & Stable
━━━━━━━━━━━━━━`
      }, { quoted: msg });

    } catch (err) {
      console.log("UPTIME ERROR:", err);
      extra.reply("❌ Failed to get uptime.");
    }
  }
};
