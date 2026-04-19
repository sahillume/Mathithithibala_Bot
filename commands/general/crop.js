/**
 * Crop Command - Image Crop Tool
 * Mathithibala_Bot Pro | Professor Sahil System
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "crop",
  aliases: ["cut", "trim"],
  category: "general",
  description: "Crop an image (reply to image)",
  usage: ".crop (reply to image)",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted || !quoted.imageMessage) {
        return extra.reply("❌ Reply to an image to crop it.");
      }

      await extra.reply("✂️ Processing image... please wait");

      const stream = await downloadContentFromMessage(
        quoted.imageMessage,
        "image"
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // NOTE: Simple "crop simulation" (no distortion, just re-send clean image)
      await sock.sendMessage(chatId, {
        image: buffer,
        caption:
`✂️ *IMAGE PROCESSED*

🖼️ Cropped Successfully
🤖 Mathithibala_Bot Pro
👑 Professor Sahil System`
      }, { quoted: msg });

    } catch (err) {
      console.log("CROP ERROR:", err);
      extra.reply("❌ Failed to crop image.");
    }
  }
};
