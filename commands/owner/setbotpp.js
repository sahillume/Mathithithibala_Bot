const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Set Bot Profile Picture
 */

module.exports = {
  name: 'setbotpp',
  aliases: ['setppbot', 'setpp'],
  category: 'owner',
  description: 'Set bot profile picture from image or sticker',
  usage: '.setbotpp (reply to image/sticker)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const imagePath = path.join(getTempDir(), `botpp_${Date.now()}.jpg`);

    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;

      // ===============================
      // CHECK REPLY
      // ===============================
      if (!quoted) {
        return extra.reply(
          '⚠️ Please reply to an image or sticker with .setbotpp'
        );
      }

      const mediaMsg = quoted.imageMessage || quoted.stickerMessage;

      if (!mediaMsg) {
        return extra.reply(
          '❌ Reply must be an image or sticker!'
        );
      }

      // ===============================
      // DOWNLOAD MEDIA
      // ===============================
      const stream = await downloadContentFromMessage(mediaMsg, 'image');

      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // ===============================
      // SIZE CHECK
      // ===============================
      if (buffer.length > MAX_FILE_SIZE) {
        return extra.reply(
          `❌ File too large (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`
        );
      }

      // ===============================
      // SAVE IMAGE
      // ===============================
      fs.writeFileSync(imagePath, buffer);

      // ===============================
      // UPDATE PROFILE PICTURE
      // ===============================
      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      await sock.updateProfilePicture(botJid, {
        url: imagePath
      });

      // ===============================
      // SUCCESS
      // ===============================
      return extra.reply(
        '✅ Bot profile picture updated successfully!'
      );

    } catch (error) {
      console.error('setbotpp error:', error);
      return extra.reply(
        '❌ Failed to update bot profile picture.'
      );
    } finally {
      try {
        deleteTempFile(imagePath);
      } catch (e) {
        console.log('Cleanup error:', e.message);
      }
    }
  }
};
