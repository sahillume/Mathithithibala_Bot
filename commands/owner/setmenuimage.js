const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

/**
 * SetMenuImage Command - Owner only
 * Set/change menu image from replied media
 */

module.exports = {
  name: 'setmenuimage',
  aliases: ['setmenuimg', 'changemenuimage'],
  category: 'owner',
  description: 'Set or change menu image (reply to image/sticker)',
  usage: '.setmenuimage (reply to image/sticker)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      // ===============================
      // CHECK REPLY
      // ===============================
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return extra.reply(
          '📷 Please reply to an image or sticker to set menu image.'
        );
      }

      const quoted = ctx.quotedMessage;
      const isImage = !!quoted.imageMessage;
      const isSticker = !!quoted.stickerMessage;

      if (!isImage && !isSticker) {
        return extra.reply(
          '❌ Reply must be an image or sticker only.'
        );
      }

      // ===============================
      // DOWNLOAD MEDIA
      // ===============================
      const targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: quoted,
      };

      const buffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      if (!buffer) {
        return extra.reply('❌ Failed to download media. Try again.');
      }

      // ===============================
      // CONVERT TO JPG
      // ===============================
      let finalBuffer = buffer;

      try {
        finalBuffer = await sharp(buffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch (e) {
        return extra.reply('❌ Failed to process image format.');
      }

      // ===============================
      // SAVE FILE
      // ===============================
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (e) {
        console.warn('Old image delete failed:', e.message);
      }

      fs.writeFileSync(imagePath, finalBuffer);

      // ===============================
      // SUCCESS
      // ===============================
      return extra.reply(
        '✅ Menu image updated successfully!'
      );

    } catch (error) {
      console.error('SetMenuImage error:', error);
      return extra.reply(
        `❌ Error: ${error.message}`
      );
    }
  }
};
