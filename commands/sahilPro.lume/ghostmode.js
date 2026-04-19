/**
 * 👻 Sahil Pro Ghost Mode System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Stealth Core
 */

const config = require('../../config');

let ghostState = false;

module.exports = {
  name: 'ghostmode',
  aliases: ['ghost', 'stealth'],
  category: 'sahilPro',
  description: 'Enable or disable ghost (stealth) mode',
  usage: '.ghostmode on/off',

  async execute(sock, msg, args, extra) {
    try {
      const from = msg.key.remoteJid;
      const mode = (args[0] || '').toLowerCase();

      // ===============================
      // 📌 HELP MENU
      // ===============================
      if (!mode) {
        return extra.reply(
`╭━━『 👻 Ghost Mode System 』━━╮

⚡ Controls bot visibility behavior

📌 Usage:
.ghostmode on
.ghostmode off

👑 Status: ${ghostState ? "ACTIVE" : "INACTIVE"}

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 🔄 TOGGLE LOGIC
      // ===============================
      if (mode === 'on') {
        ghostState = true;

        console.log('[GHOST MODE] Activated');

        return extra.reply(
`👻 Ghost Mode: ACTIVATED

⚡ Bot is now in stealth behavior mode
🧠 Reduced system logging enabled
👑 Sahil Pro Protection Active`
        );
      }

      if (mode === 'off') {
        ghostState = false;

        console.log('[GHOST MODE] Deactivated');

        return extra.reply(
`👻 Ghost Mode: DEACTIVATED

⚡ Bot returned to normal operation
🧠 Full system visibility enabled`
        );
      }

      return extra.reply('❌ Invalid option. Use on/off');

    } catch (err) {
      console.log("GhostMode Error:", err.message);
      return extra.reply("❌ Ghost mode system error.");
    }
  }
};
