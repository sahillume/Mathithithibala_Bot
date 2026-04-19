/**
 * ⚙️ Sahil Pro System Dashboard
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Core Diagnostics
 */

const os = require('os');
const config = require('../../config');

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

module.exports = {
  name: 'system',
  aliases: ['status', 'botinfo', 'runtime'],
  category: 'sahilPro',
  description: 'Displays bot system information',
  usage: '.system',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;

      const uptime = formatUptime(process.uptime());
      const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

      const systemInfo = `
╭━━『 ⚙️ SYSTEM DASHBOARD 』━━╮

🤖 Bot Name: ${config.botName}
👑 Owner: ${config.ownerName}

⏱ Uptime: ${uptime}
🧠 RAM Usage: ${memoryUsage.toFixed(2)} MB

💻 Platform: ${os.platform()}
⚙️ CPU Cores: ${os.cpus().length}
📊 Node Version: ${process.version}

🔐 Mode: Sahil Pro Active System

╰━━━━━━━━━━━━━━━━━━
`;

      return sock.sendMessage(from, {
        text: systemInfo
      }, { quoted: msg });

    } catch (err) {
      console.log("System Error:", err.message);
      return extra.reply("❌ System info error.");
    }
  }
};
