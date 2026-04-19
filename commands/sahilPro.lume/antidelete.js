 /**
  * 🚫 Sahil Pro Anti-Delete System
  * Folder: commands/sahilPro.lume/
  * Author: Professor Sahil
  * System: Mathithibala_Bot Pro Security Module
  */

const store = new Map(); // temporary message cache (in-memory)

module.exports = {
  name: 'antidelete',
  aliases: ['antidel', 'revealdelete'],
  category: 'sahilPro',
  description: 'Stores messages and recovers deleted messages',
  usage: '.antidelete (auto system)',

  /**
   * ⚠️ NOTE:
   * This is NOT a command users trigger.
   * It runs via message events in handler/index.js
   */

  async saveMessage(msg) {
    try {
      const key = msg.key?.id;
      if (!key) return;

      const content =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        msg.message?.documentMessage?.caption ||
        null;

      if (!content) return;

      store.set(key, {
        content,
        sender: msg.key.participant || msg.key.remoteJid,
        timestamp: Date.now()
      });

    } catch (err) {
      console.log("AntiDelete Save Error:", err.message);
    }
  },

  async onDelete(sock, msg) {
    try {
      const key = msg.key?.id;
      const data = store.get(key);

      if (!data) return;

      const chatId = msg.key.remoteJid;

      const recoveredText =
`🚫 *DELETED MESSAGE DETECTED*

👤 Sender: ${data.sender.split('@')[0]}
⏰ Time: ${new Date(data.timestamp).toLocaleString()}

📩 Message:
${data.content}

⚡ System: Sahil Anti-Delete Active`;

      await sock.sendMessage(chatId, {
        text: recoveredText
      });

    } catch (err) {
      console.log("AntiDelete Restore Error:", err.message);
    }
  }
};
