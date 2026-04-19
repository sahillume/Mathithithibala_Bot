/**
 * 📢 Sahil Pro Post To Status System
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Status Engine
 */

module.exports = {
  name: 'posttostatus',
  aliases: ['statuspost', 'broadcaststatus'],
  category: 'sahilPro',
  description: 'Post text or media to WhatsApp status',
  usage: '.posttostatus <text>',

  async execute(sock, msg, args, extra) {
    try {
      const from = msg.key.remoteJid;
      const text = args.join(' ');

      // ===============================
      // 📌 NO INPUT
      // ===============================
      if (!text) {
        return extra.reply(
`╭━━『 📢 Status Poster 』━━╮

📌 Usage:
.posttostatus Hello world

⚡ Sends message to WhatsApp status

👑 Sahil Pro System

╰━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📢 POST STATUS
      // ===============================
      await sock.sendMessage('status@broadcast', {
        text: `📢 ${text}\n\n🤖 Posted by Mathithibala_Bot`
      });

      return extra.reply(
`📢 *Status Posted Successfully*

📝 Content:
${text}

⚡ Sahil Pro Engine`
      );

    } catch (err) {
      console.log("PostToStatus Error:", err.message);
      return extra.reply("❌ Failed to post status.");
    }
  }
};
