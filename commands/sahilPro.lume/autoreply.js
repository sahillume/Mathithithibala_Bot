/**
 * 🤖 Mathithibala_Bot Smart AutoReply System (PRO MAX)
 * Folder: commands/sahilPro.lume/
 * Owner: Professor Sahil
 */

const axios = require('axios');
const config = require('../../config');

// ===============================
// ⏱ SIMPLE IN-MEMORY COOLDOWN
// ===============================
const cooldown = new Map();

module.exports = {
  name: 'autoreply',
  aliases: ['autobot', 'smartreply'],
  category: 'sahilPro',
  description: 'AI Auto Reply System (Internal Engine)',
  usage: '.autoreply (internal)',

  /**
   * ⚠️ INTERNAL ENGINE ONLY
   */
  async handle(sock, msg, text) {
    try {
      const chatId = msg.key.remoteJid;
      if (!chatId || !text) return;

      text = text.trim();
      if (text.length < 2) return;

      const sender = msg.key.participant || msg.key.remoteJid;
      const key = `${chatId}_${sender}`;

      // ===============================
      // 🚫 SIMPLE COOLDOWN (ANTI SPAM)
      // ===============================
      const now = Date.now();
      const last = cooldown.get(key) || 0;

      if (now - last < 2500) return; // 2.5 sec delay per user
      cooldown.set(key, now);

      // ===============================
      // 🤖 AI REQUEST (SAFE)
      // ===============================
      let reply;

      try {
        const res = await axios.get(
          'https://api.affiliateplus.xyz/api/chatbot',
          {
            params: {
              message: text,
              botname: config.botName || 'Mathithibala_Bot',
              ownername: config.ownerName || 'Professor Sahil'
            },
            timeout: 8000
          }
        );

        reply =
          res?.data?.message ||
          "🤖 I didn't understand that.";

      } catch {
        // ===============================
        // 🔁 OFFLINE FALLBACK RESPONSE
        // ===============================
        const fallback = [
          "🤖 I'm thinking...",
          "⚡ Can you rephrase that?",
          "🧠 I'm not sure, try again.",
          "🤖 I'm still learning this topic."
        ];

        reply = fallback[Math.floor(Math.random() * fallback.length)];
      }

      // ===============================
      // 📩 SEND RESPONSE
      // ===============================
      await sock.sendMessage(chatId, {
        text:
`🤖 *Mathithibala_Bot AI*

${reply}

👑 Powered by Professor Sahil`
      }, { quoted: msg });

      return true;

    } catch (err) {
      console.log('❌ AutoReply Error:', err.message);

      try {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "⚠️ AI system temporarily unavailable."
        }, { quoted: msg });
      } catch {}
    }
  }
};
