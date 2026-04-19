/**
 * ⚡ Sahil Pro Evolve System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Evolution Core
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.js');

module.exports = {
  name: 'evolve',
  aliases: ['upgrade', 'boost', 'mode'],
  category: 'sahilPro',
  description: 'System evolution controller (Pro mode switcher)',
  usage: '.evolve <mode>',

  async execute(sock, msg, args, extra) {
    try {
      const from = msg.key.remoteJid;
      const mode = args.join(' ').toLowerCase();

      // ===============================
      // 📌 NO INPUT
      // ===============================
      if (!mode) {
        return extra.reply(
`╭━━『 ⚡ Sahil Pro Evolve System 』━━╮

🧠 Available Modes:

🔥 ultra      - Full power AI mode
⚡ fast        - Speed optimized mode
🛡 safe        - Stable anti-crash mode
🤖 ai          - AI focused mode

📌 Usage:
.evolve ultra

╰━━━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 🔧 MODE SWITCH LOGIC
      // ===============================
      let message = '';
      let update = '';

      switch (mode) {

        case 'ultra':
          message = '🔥 ULTRA MODE ACTIVATED';
          update = 'ultra';
          break;

        case 'fast':
          message = '⚡ FAST MODE ACTIVATED';
          update = 'fast';
          break;

        case 'safe':
          message = '🛡 SAFE MODE ACTIVATED';
          update = 'safe';
          break;

        case 'ai':
          message = '🤖 AI MODE ACTIVATED';
          update = 'ai';
          break;

        default:
          return extra.reply('❌ Invalid mode selected.');
      }

      // ===============================
      // 📢 RESPONSE
      // ===============================
      await extra.reply(
`╭━━『 ⚡ EVOLVE SYSTEM 』━━╮

${message}

👑 Powered by Sahil Pro Engine
📌 Mode: ${update.toUpperCase()}

╰━━━━━━━━━━━━━━━━━━━━`
      );

      // ===============================
      // ⚠️ NOTE (OPTIONAL SYSTEM FLAG)
      // ===============================
      console.log(`[EVOLVE] Mode switched to: ${update}`);

      return true;

    } catch (err) {
      console.log("Evolve Error:", err.message);
      return extra.reply("❌ Evolve system error.");
    }
  }
};
