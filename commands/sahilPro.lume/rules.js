/**
 * 📜 Sahil Pro Rules System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Governance Core
 */

module.exports = {
  name: 'rules',
  aliases: ['grouprules', 'guidelines', 'policy'],
  category: 'sahilPro',
  description: 'Displays group or bot rules',
  usage: '.rules',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;

      // ===============================
      // 📜 RULES CONTENT
      // ===============================
      const rulesText = `
╭━━『 📜 GROUP RULES 』━━╮

1️⃣ Respect all members
2️⃣ No spam or flooding
3️⃣ No fake links or scams
4️⃣ No abusive language
5️⃣ Follow admin instructions
6️⃣ No unauthorized bots
7️⃣ No mass tagging
8️⃣ Keep content relevant

━━━━━━━━━━━━━━━━━━
🤖 Bot Rules (Sahil Pro)

⚡ Do not spam commands
⚡ Use bot responsibly
⚡ Avoid abusing system features

━━━━━━━━━━━━━━━━━━
👑 Powered by Professor Sahil
🤖 Mathithibala_Bot System

╰━━━━━━━━━━━━━━━━━━
`;

      return sock.sendMessage(from, {
        text: rulesText
      }, { quoted: msg });

    } catch (err) {
      console.log("Rules Error:", err.message);
      return extra.reply("❌ Failed to load rules.");
    }
  }
};
