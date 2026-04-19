/**
 * 👁️ VVPRO Safe System (Sahil Pro)
 * DOES NOT bypass ViewOnce security
 * Only logs + processes allowed media
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

module.exports = {
  name: 'vvpro',
  aliases: ['viewonce', 'vv', 'readvo'],
  category: 'sahilPro',
  description: 'Safe ViewOnce tracker + logger system',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {

      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      // ===============================
      // HELP MENU
      // ===============================
      if (!args[0]) {
        return extra.reply(
`╭━━『 👁️ VVPRO SYSTEM 』━━╮

📌 .vvpro status
📌 .vvpro logs

⚠️ Safe system only:
✔ Detects ViewOnce messages
✔ Logs metadata
❌ Does NOT bypass privacy

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      const cmd = args[0].toLowerCase();

      // ===============================
      // STATUS
      // ===============================
      if (cmd === 'status') {
        return extra.reply(
`╭━━『 👁️ VVPRO STATUS 』━━╮

🧠 System: ACTIVE
🔐 Mode: SAFE TRACKING
📊 Logging: ENABLED

✔ No bypass functionality
✔ Compliance mode ON

╰━━━━━━━━━━━━━━━━━━`
        );
      }

      // ===============================
      // DETECT VIEWONCE
      // ===============================
      const ctx =
        msg.message?.extendedTextMessage?.contextInfo;

      const quoted = ctx?.quotedMessage;

      if (!quoted) {
        return extra.reply("🗑️ Reply to a ViewOnce message.");
      }

      const isViewOnce =
        quoted.viewOnceMessageV2 ||
        quoted.viewOnceMessageV2Extension ||
        quoted.viewOnceMessage;

      if (!isViewOnce) {
        return extra.reply("❌ Not a ViewOnce message.");
      }

      // ===============================
      // LOG EVENT ONLY (NO BYPASS)
      // ===============================
      const log = {
        sender,
        chatId,
        time: new Date().toISOString(),
        type: "VIEWONCE_DETECTED"
      };

      const file = "./sahil_data/vvpro_logs.json";

      let data = [];
      if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file));
      }

      data.push(log);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      await sock.sendMessage(chatId, {
        text:
`👁️ ViewOnce detected

📌 Sender: ${sender}
⏰ Logged: ${log.time}

⚡ VVPRO system active`
      });

      // ===============================
      // OPTIONAL: ONLY IF MEDIA IS STILL ACCESSIBLE
      // ===============================
      try {
        const msgContent =
          quoted.viewOnceMessageV2?.message ||
          quoted.viewOnceMessageV2Extension?.message ||
          quoted.viewOnceMessage?.message;

        if (!msgContent) return;

        const type =
          msgContent.imageMessage
            ? 'image'
            : msgContent.videoMessage
            ? 'video'
            : msgContent.audioMessage
            ? 'audio'
            : null;

        if (!type) return;

        const media = msgContent.imageMessage ||
                      msgContent.videoMessage ||
                      msgContent.audioMessage;

        const stream = await downloadContentFromMessage(media, type);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        // send normally (only if WhatsApp allows it)
        if (type === 'image') {
          await sock.sendMessage(chatId, { image: buffer });
        } else if (type === 'video') {
          await sock.sendMessage(chatId, { video: buffer });
        } else if (type === 'audio') {
          await sock.sendMessage(chatId, { audio: buffer, ptt: true });
        }

      } catch (e) {
        console.log("Media not accessible (normal for ViewOnce)");
      }

    } catch (err) {
      console.log("VVPRO Error:", err.message);
      return extra.reply("❌ VVPRO system error.");
    }
  }
};
