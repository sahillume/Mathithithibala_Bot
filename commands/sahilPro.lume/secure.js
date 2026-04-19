/**
 * 🔐 Sahil Pro Secure System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Security Core
 */

const fs = require('fs');
const path = require('path');

let secureState = {
  antiCrash: true,
  commandLock: false,
  systemLock: false
};

module.exports = {
  name: 'secure',
  aliases: ['security', 'lock', 'protection'],
  category: 'sahilPro',
  description: 'Bot security control system',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;
      const mode = (args[0] || '').toLowerCase();

      // ===============================
      // 📌 HELP MENU
      // ===============================
      if (!mode) {
        return extra.reply(
`╭━━『 🔐 SAHIL SECURITY SYSTEM 』━━╮

⚙️ Controls bot safety features:

📌 Commands:
.secure on
.secure off
.secure status
.secure lock
.secure unlock

━━━━━━━━━━━━━━━━━━
🛡 AntiCrash: ${secureState.antiCrash ? "ON" : "OFF"}
🔒 CommandLock: ${secureState.commandLock ? "ON" : "OFF"}
⚠️ SystemLock: ${secureState.systemLock ? "ON" : "OFF"}

👑 Owner: Professor Sahil

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📊 STATUS
      // ===============================
      if (mode === 'status') {
        return extra.reply(
`╭━━『 🔐 SECURITY STATUS 』━━╮

🛡 AntiCrash: ${secureState.antiCrash ? "ACTIVE" : "DISABLED"}
🔒 CommandLock: ${secureState.commandLock ? "ACTIVE" : "DISABLED"}
⚠️ SystemLock: ${secureState.systemLock ? "ACTIVE" : "DISABLED"}

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 🔐 LOCK SYSTEM
      // ===============================
      if (mode === 'lock') {
        secureState.commandLock = true;

        console.log('[SECURE] Command system locked');

        return extra.reply(
`🔒 Command System LOCKED

⚡ Bot commands are now restricted
👑 Sahil Pro Security Active`
        );
      }

      // ===============================
      // 🔓 UNLOCK SYSTEM
      // ===============================
      if (mode === 'unlock') {
        secureState.commandLock = false;

        console.log('[SECURE] Command system unlocked');

        return extra.reply(
`🔓 Command System UNLOCKED

⚡ Bot commands restored
👑 Sahil Pro Security Active`
        );
      }

      // ===============================
      // 🛡 TURN ON SECURITY
      // ===============================
      if (mode === 'on') {
        secureState.antiCrash = true;

        return extra.reply(
`🛡 Security System ENABLED

⚡ AntiCrash protection ON
⚡ System stabilized
👑 Sahil Pro Engine`
        );
      }

      // ===============================
      // ❌ TURN OFF SECURITY
      // ===============================
      if (mode === 'off') {
        secureState.antiCrash = false;

        return extra.reply(
`⚠️ Security System DISABLED

❗ Bot is now vulnerable
👑 Sahil Pro Warning`
        );
      }

      return extra.reply('❌ Invalid option. Use on/off/lock/unlock/status');

    } catch (err) {
      console.log("Secure Error:", err.message);
      return extra.reply("❌ Security system error.");
    }
  },

  // ===============================
  // 🔌 EXPORT STATE FOR HANDLER USE
  // ===============================
  getSecureState: () => secureState
};
