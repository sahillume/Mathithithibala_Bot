const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'viewonce',
  aliases: ['readvo', 'vv', 'readviewonce'],
  category: 'general',
  description: 'Unlock view-once messages',
  usage: '.viewonce (reply to view-once)',

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;

      const ctx =
        msg.message?.extendedTextMessage?.contextInfo ||
        msg.message?.imageMessage?.contextInfo ||
        msg.message?.videoMessage?.contextInfo;

      if (!ctx?.quotedMessage) return;

      const quotedMsg = ctx.quotedMessage;

      const isViewOnce =
        quotedMsg.viewOnceMessageV2 ||
        quotedMsg.viewOnceMessage ||
        quotedMsg.imageMessage?.viewOnce ||
        quotedMsg.videoMessage?.viewOnce ||
        quotedMsg.audioMessage?.viewOnce;

      if (!isViewOnce) return;

      let actualMsg = null;

      if (quotedMsg.viewOnceMessageV2?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2.message;
      } else if (quotedMsg.viewOnceMessage?.message) {
        actualMsg = quotedMsg.viewOnceMessage.message;
      } else if (quotedMsg.imageMessage?.viewOnce) {
        actualMsg = { imageMessage: quotedMsg.imageMessage };
      } else if (quotedMsg.videoMessage?.viewOnce) {
        actualMsg = { videoMessage: quotedMsg.videoMessage };
      } else if (quotedMsg.audioMessage?.viewOnce) {
        actualMsg = { audioMessage: quotedMsg.audioMessage };
      }

      if (!actualMsg) return;

      const mtype = Object.keys(actualMsg)[0];
      const media = actualMsg[mtype];

      const type =
        mtype === 'imageMessage'
          ? 'image'
          : mtype === 'videoMessage'
          ? 'video'
          : 'audio';

      const stream = await downloadContentFromMessage(media, type);

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = media?.caption || '';

      // 🔥 PROFESSIONAL BRAND MESSAGE
      const header =
`╭━━『 🔓 *VIEW ONCE UNLOCKED* 』━━╮
📌 *View Once has been automatically unlocked*
🤖 *By Mathithibala Bot System*
──────────────────────`;

      const footer =
`──────────────────────
💡 Powered by Mathithibala Hacker Bot
⚡ Status: Successfully Processed
╰━━━━━━━━━━━━━━━━━━━━╯`;

      const finalCaption = `${header}\n\n${caption}\n\n${footer}`;

      // 📸 RESEND MEDIA WITH BRANDING
      if (mtype === 'imageMessage') {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption: finalCaption
        }, { quoted: msg });

      } else if (mtype === 'videoMessage') {
        await sock.sendMessage(chatId, {
          video: buffer,
          caption: finalCaption,
          mimetype: 'video/mp4'
        }, { quoted: msg });

      } else if (mtype === 'audioMessage') {
        await sock.sendMessage(chatId, {
          audio: buffer,
          ptt: true,
          mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: msg });
      }

    } catch (error) {
      console.log('ViewOnce error:', error);
    }
  }
};
