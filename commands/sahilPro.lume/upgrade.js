/**
 * 🚀 Sahil Pro Upgrade System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Evolution Core
 */

const fs = require('fs');
const config = require('../../config');

let version = "1.0.0";
let features = {
  ai: true,
  security: true,
  media: true,
  autopost: false,
  ghostmode: false
};

module.exports = {
  name: 'upgrade',
  aliases: ['update', 'systemupgrade', 'boost'],
  category: 'sahilPro',
  description: 'Upgrade or manage bot system features',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;
      const cmd = (args[0] || '').toLowerCase();

      // ===============================
      // 📌 HELP MENU
      // ===============================
      if (!cmd) {
        return extra.reply(
`╭━━『 🚀 SAHIL PRO UPGRADE 』━━╮

⚙️ Commands:

.upgrade status
.upgrade ai on/off
.upgrade security on/off
.upgrade media on/off
.upgrade ghost on/off
.upgrade version

━━━━━━━━━━━━━━━━━━
📦 Current Version: ${version}

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📊 STATUS
      // ===============================
      if (cmd === 'status') {
        return extra.reply(
`╭━━『 ⚙️ SYSTEM STATUS 』━━╮

📦 Version: ${version}

🤖 AI: ${features.ai ? "ON" : "OFF"}
🔐 Security: ${features.security ? "ON" : "OFF"}
🎧 Media: ${features.media ? "ON" : "OFF"}
📤 AutoPost: ${features.autopost ? "ON" : "OFF"}
👻 GhostMode: ${features.ghostmode ? "ON" : "OFF"}

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 🤖 AI TOGGLE
      // ===============================
      if (cmd === 'ai') {
        const state = args[1];

        if (state === 'on') features.ai = true;
        if (state === 'off') features.ai = false;

        return extra.reply(`🤖 AI system is now ${features.ai ? "ENABLED" : "DISABLED"}`);
      }

      // ===============================
      // 🔐 SECURITY TOGGLE
      // ===============================
      if (cmd === 'security') {
        const state = args[1];

        if (state === 'on') features.security = true;
        if (state === 'off') features.security = false;

        return extra.reply(`🔐 Security system ${features.security ? "ENABLED" : "DISABLED"}`);
      }

      // ===============================
      // 🎧 MEDIA TOGGLE
      // ===============================
      if (cmd === 'media') {
        const state = args[1];

        if (state === 'on') features.media = true;
        if (state === 'off') features.media = false;

        return extra.reply(`🎧 Media system ${features.media ? "ENABLED" : "DISABLED"}`);
      }

      // ===============================
      // 👻 GHOST MODE
      // ===============================
      if (cmd === 'ghost') {
        const state = args[1];

        if (state === 'on') features.ghostmode = true;
        if (state === 'off') features.ghostmode = false;

        return extra.reply(`👻 Ghost Mode ${features.ghostmode ? "ACTIVE" : "OFF"}`);
      }

      // ===============================
      // 📦 VERSION INFO
      // ===============================
      if (cmd === 'version') {
        return extra.reply(
`📦 Bot Version Info

Current Version: ${version}
System: Sahil Pro Engine
Status: Stable Release`
        );
      }

      return extra.reply('❌ Invalid upgrade command.');

    } catch (err) {
      console.log("Upgrade Error:", err.message);
      return extra.reply("❌ Upgrade system error.");
    }
  }
};
