/**
 * 🤖 Sahil Pro AutoReply System
 * Folder: commands/sahilPro.lume/
 * Project: Mathithibala_Bot
 * Owner: Professor Sahil
 */

const axios = require('axios');
const config = require('../../config');

module.exports = {
  name: 'autoreply',
  aliases: ['autobot', 'smartreply'],
  category: 'sahilPro',
  description: 'AI Auto Reply System (Fallback Smart Chat)',
  usage: '.autoreply (system internal)',

  /**
   * ⚠️ This is NOT a user command.
   * It is called inside handler.js when no prefix is used.
   */

  async handle(sock, msg, text) {
    try {

      const chatId = msg.key.remoteJid;

      if (!text || text.trim().length < 2) return;

      // ===============================
      // 🤖 AI REQUEST (SAFE FALLBACK)
      // ===============================
      const res = await axios.get(
        `https://api.affiliateplus.xyz/api/chatbot`,
        {
          params: {
            message: text,
            botname: config.botName,
            ownername: config.ownerName
          }
        }
      );

      const reply =
        res?.data?.message ||
        "🤖 Sorry, I couldn't understand that.";

      // ===============================
      // 📩 SEND RESPONSE
      // ===============================
      await sock.sendMessage(chatId, {
        text: `🤖 *${config.botName} AI*\n\n${reply}`
      }, { quoted: msg });

      return true;

    } catch (err) {
      console.log("❌ AutoReply Error:", err.message);

      await sock.sendMessage(msg.key.remoteJid, {
        text: "⚠️ AutoReply system error. Try again later."
      }, { quoted: msg });
    }
  }
};
