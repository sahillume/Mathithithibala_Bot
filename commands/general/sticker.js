/**
 * Sticker Command - Mathithibala Pro System
 * Created by Professor Sahil
 */

const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stik', 'st'],
  category: 'general',
  description: 'Convert image/video to sticker (PRO MODE)',
  usage: '.sticker (reply to image/video)',

  async execute(sock, msg, args, extra) {
    try {
      const from = msg.key.remoteJid;

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const mediaMsg =
        quoted?.imageMessage ||
        quoted?.videoMessage ||
        msg.message?.imageMessage ||
        msg.message?.videoMessage;

      if (!mediaMsg) {
        return extra.reply(
          `❌ Please reply to an image or video to create a sticker.\n\nExample: .sticker`
        );
      }

      await extra.reply('🧠 Creating sticker... Please wait');

      // download media
      const stream = await sock.downloadMediaMessage(msg);
      const buffer = Buffer.from(stream);

      if (!buffer || buffer.length === 0) {
        return extra.reply('❌ Failed to process media.');
      }

      const sticker = new Sticker(buffer, {
        pack: 'Mathithibala_Bot 🤖',
        author: 'Professor Sahil 👑',
        type: StickerTypes.FULL,
        quality: 80,
        background: 'transparent'
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(from, {
        sticker: stickerBuffer
      }, { quoted: msg });

    } catch (err) {
      console.log('Sticker Error:', err);
      return extra.reply('❌ Sticker creation failed. Try again.');
    }
  }
};
