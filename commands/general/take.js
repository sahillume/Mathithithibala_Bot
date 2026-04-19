/**
 * Sticker Take Command - Sahil Pro System
 * Rename / watermark stickers professionally
 */

const fs = require('fs');
const path = require('path');
const { writeFileSync, unlinkSync } = require('fs');

module.exports = {
  name: 'take',
  aliases: ['wm', 'watermark'],
  category: 'general',
  description: 'Adds custom watermark/text to stickers',
  usage: '.take <text> (reply to sticker)',

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;
      const text = args.join(' ') || 'Mathithibala_Bot';

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted || !quoted.stickerMessage) {
        return await sock.sendMessage(chatId, {
          text: '❌ Reply to a *sticker* to use this command.\n\nExample: .take Sahil Pro'
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        text: '⏳ Processing sticker...\n⚡ Sahil Pro Engine is working'
      }, { quoted: msg });

      // Download sticker
      const stream = await sock.downloadMediaMessage(
        { message: quoted },
        'buffer'
      );

      if (!stream) {
        return await sock.sendMessage(chatId, {
          text: '❌ Failed to read sticker.'
        }, { quoted: msg });
      }

      // Save temp file
      const filePath = path.join(__dirname, 'temp.webp');
      fs.writeFileSync(filePath, stream);

      // Send as new sticker with caption watermark text
      await sock.sendMessage(chatId, {
        sticker: fs.readFileSync(filePath),
        packname: text,
        author: 'Made by Mathithibala_Bot | Sahil Pro'
      }, { quoted: msg });

      // Cleanup
      unlinkSync(filePath);

      await sock.sendMessage(chatId, {
        text: `✅ Sticker updated successfully!\n\n👑 Watermark: ${text}\n🤖 Sahil Pro System Active`
      });

    } catch (err) {
      console.log('Take command error:', err);

      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Error processing sticker. Try again later.'
      }, { quoted: msg });
    }
  }
};
