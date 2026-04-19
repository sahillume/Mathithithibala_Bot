/**
 * QR Command - Generate QR Code from text
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const axios = require('axios');

module.exports = {
  name: 'qr',
  aliases: ['qrcode', 'makeqr'],
  category: 'general',
  description: 'Generate QR code from text',
  usage: '.qr <text>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;
      const text = args.join(' ');

      if (!text) {
        return extra.reply(
          `❌ Please provide text to generate QR code.\n\nExample:\n.qr Hello World`
        );
      }

      await extra.reply('📱 Generating QR code...');

      // QR API (stable and fast)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;

      await sock.sendMessage(chatId, {
        image: { url: qrUrl },
        caption:
`📱 *QR Code Generated*

📝 Text: ${text}

🤖 Powered by Mathithibala_Bot Pro
👑 Professor Sahil System`
      }, { quoted: msg });

    } catch (err) {
      console.log('QR ERROR:', err);
      extra.reply('❌ Failed to generate QR code.');
    }
  }
};
