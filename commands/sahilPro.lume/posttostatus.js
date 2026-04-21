/**
 * 📢 Mathithibala_Bot Status Engine (PRO MAX)
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 */

module.exports = {
  name: 'posttostatus',
  aliases: ['statuspost', 'broadcaststatus'],
  category: 'sahilPro',
  description: 'Post text or media to WhatsApp status',
  usage: '.posttostatus <text>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ').trim();

      // ===============================
      // 📌 NO INPUT HANDLER
      // ===============================
      if (!text) {
        return extra.reply(
`╭━━『 📢 Status Poster 』━━╮

📌 Usage:
.posttostatus Hello world

📷 You can also reply to media + use command

🤖 Mathithibala_Bot Status Engine

╰━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📢 STATUS CONTENT
      // ===============================
      const statusText =
`📢 ${text}

🤖 Mathithibala_Bot
👑 Powered by Professor Sahil`;

      // ===============================
      // 📤 SEND TEXT STATUS (SAFE)
      // ===============================
      await sock.sendMessage('status@broadcast', {
        text: statusText
      });

      // ===============================
      // ✅ SUCCESS MESSAGE
      // ===============================
      return extra.reply(
`╭━━『 ✅ STATUS POSTED 』━━╮

📝 Message:
${text}

📡 Sent to WhatsApp Status

🤖 Mathithibala_Bot Engine

╰━━━━━━━━━━━━━━`
      );

    } catch (err) {
      console.log('[STATUS ERROR]', err);

      return extra.reply(
`❌ Failed to post status

⚠️ Reason: ${err.message || 'Unknown error'}`
      );
    }
  }
};
