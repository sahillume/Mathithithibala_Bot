/**
 * Temp Manager - Clean bot temporary files
 * Professional version by Mathithibala Bot
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'temp',
  aliases: ['cleantemp', 'cache', 'flush'],
  category: 'admin',
  desc: 'Manage bot temporary files',
  usage: '.temp clean / .temp info',
  groupOnly: false,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const action = args[0]?.toLowerCase();
      const tempDir = path.join(__dirname, '../../temp');

      // 📊 TEMP INFO
      if (!action || action === 'info') {
        let fileCount = 0;
        let totalSize = 0;

        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);

          fileCount = files.length;

          files.forEach(file => {
            const filePath = path.join(tempDir, file);
            try {
              const stats = fs.statSync(filePath);
              totalSize += stats.size;
            } catch {}
          });
        }

        return await sock.sendMessage(msg.key.remoteJid, {
          text: `╭━━『 🧹 *TEMP SYSTEM* 』━━╮

📊 Temp Folder Status:

📁 Files: ${fileCount}
💾 Size: ${(totalSize / 1024).toFixed(2)} KB

📌 Commands:
• .temp info
• .temp clean

⚡ Keeps bot memory clean & fast

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      // 🧹 CLEAN TEMP FILES
      if (action === 'clean') {
        if (!fs.existsSync(tempDir)) {
          return await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ Temp folder does not exist.'
          }, { quoted: msg });
        }

        const files = fs.readdirSync(tempDir);
        let deleted = 0;

        files.forEach(file => {
          const filePath = path.join(tempDir, file);
          try {
            fs.unlinkSync(filePath);
            deleted++;
          } catch {}
        });

        return await sock.sendMessage(msg.key.remoteJid, {
          text: `╭━━『 🧹 *TEMP CLEANED* 』━━╮

✅ Deleted Files: ${deleted}

⚡ Bot memory optimized
🚀 Performance improved

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      // ❌ INVALID OPTION
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Invalid option!\n\nUse:\n.temp info\n.temp clean'
      }, { quoted: msg });

    } catch (error) {
      console.error('Temp Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to manage temp files.'
      }, { quoted: msg });
    }
  }
};
