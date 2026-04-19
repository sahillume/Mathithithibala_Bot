/**
 * 🎧 Sahil Pro Status Audio Uploader
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 * System: Mathithibala_Bot Media Core
 */

const fs = require('fs');

module.exports = {
  name: 'tostatusaudio',
  aliases: ['statusaudio', 'audiosave', 'postaudio'],
  category: 'sahilPro',
  description: 'Send audio to WhatsApp status',
  usage: '.tostatusaudio (reply to audio)',

  async execute(sock, msg, args, extra) {
    try {

      const from = msg.key.remoteJid;

      // ===============================
      // 🎧 GET AUDIO FROM MESSAGE
      // ===============================
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const audio =
        quoted?.audioMessage ||
        msg.message?.audioMessage;

      if (!audio) {
        return extra.reply(
`╭━━『 🎧 STATUS AUDIO 』━━╮

📌 Reply to an audio message
OR send an audio with command

Example:
.reply audio + .tostatusaudio

╰━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // 📥 DOWNLOAD AUDIO BUFFER
      // ===============================
      const stream = await sock.downloadMediaMessage(msg);
      const buffer = Buffer.from(stream);

      if (!buffer) {
        return extra.reply('❌ Failed to process audio.');
      }

      // ===============================
      // 📤 POST TO STATUS
      // ===============================
      await sock.sendMessage('status@broadcast', {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: true
      });

      return extra.reply(
`✅ Audio posted to status successfully

🎧 Powered by Sahil Pro System`
      );

    } catch (err) {
      console.log("Status Audio Error:", err.message);
      return extra.reply("❌ Failed to upload audio status.");
    }
  }
};
