/**
 * VVPRO - Mathithibala Pro ViewOnce Unlock System
 * Powered by Professor Sahil
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'vvpro',
  aliases: ['viewoncepro', 'vv', 'readvo', 'unlockvo'],
  category: 'pro',
  description: 'Unlock and display ViewOnce messages (Pro System)',
  usage: '.vvpro (reply to view-once message)',

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;

      const ctx =
        msg.message?.extendedTextMessage?.contextInfo ||
        msg.message?.imageMessage?.contextInfo ||
        msg.message?.videoMessage?.contextInfo ||
        msg.message?.buttonsResponseMessage?.contextInfo ||
        msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return await sock.sendMessage(chatId, {
          text: '🧠 *VVPRO SYSTEM*\n\n❌ Please reply to a view-once message to unlock it.'
        }, { quoted: msg });
      }

      const quotedMsg = ctx.quotedMessage;

      const hasViewOnce =
        quotedMsg.viewOnceMessageV2 ||
        quotedMsg.viewOnceMessageV2Extension ||
        quotedMsg.viewOnceMessage ||
        quotedMsg.imageMessage?.viewOnce ||
        quotedMsg.videoMessage?.viewOnce ||
        quotedMsg.audioMessage?.viewOnce;

      if (!hasViewOnce) {
        return await sock.sendMessage(chatId, {
          text: '❌ This message is not a view-once media.'
        }, { quoted: msg });
      }

      let actualMsg = null;
      let mtype = null;

      if (quotedMsg.viewOnceMessageV2Extension?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2Extension.message;
        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.viewOnceMessageV2?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2.message;
        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.viewOnceMessage?.message) {
        actualMsg = quotedMsg.viewOnceMessage.message;
        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.imageMessage?.viewOnce) {
        actualMsg = { imageMessage: quotedMsg.imageMessage };
        mtype = 'imageMessage';

      } else if (quotedMsg.videoMessage?.viewOnce) {
        actualMsg = { videoMessage: quotedMsg.videoMessage };
        mtype = 'videoMessage';

      } else if (quotedMsg.audioMessage?.viewOnce) {
        actualMsg = { audioMessage: quotedMsg.audioMessage };
        mtype = 'audioMessage';
      }

      if (!actualMsg || !mtype) {
        return await sock.sendMessage(chatId, {
          text: '❌ Unsupported view-once format.'
        }, { quoted: msg });
      }

      const type =
        mtype.includes('image') ? 'image'
        : mtype.includes('video') ? 'video'
        : 'audio';

      const stream = await downloadContentFromMessage(actualMsg[mtype], type);

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = actualMsg[mtype]?.caption || '';

      // 📤 SEND MEDIA
      if (type === 'video') {
        await sock.sendMessage(chatId, {
          video: buffer,
          caption,
          mimetype: 'video/mp4'
        }, { quoted: msg });

      } else if (type === 'image') {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption,
          mimetype: 'image/jpeg'
        }, { quoted: msg });

      } else if (type === 'audio') {
        await sock.sendMessage(chatId, {
          audio: buffer,
          ptt: true,
          mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: msg });
      }

      // 🧠 FINAL PRO MESSAGE (YOUR REQUEST)
      await sock.sendMessage(chatId, {
        text:
`╭━━『 🔓 VVPRO SYSTEM 』━━╮
✅ ViewOnce Successfully Unlocked

🤖 Powered by: Mathithibala_Bot Pro
👑 Developed by: Professor Sahil

⚡ Status: Media Retrieved Successfully
╰━━━━━━━━━━━━━━━━━━`
      });

    } catch (error) {
      console.error('VVPRO Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ VVPRO system error occurred.'
      }, { quoted: msg });
    }
  }
};
