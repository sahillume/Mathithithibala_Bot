/**
 * GetPP Command - Fetch WhatsApp Profile Picture
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: "getpp",
  aliases: ["pp", "profilepic", "avatar"],
  category: "general",
  description: "Get WhatsApp profile picture of a user",
  usage: ".getpp @user or reply to user",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      // get mentioned or replied user
      let target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.message?.key?.participant ||
        msg.key.participant ||
        msg.key.remoteJid;

      if (!target) {
        return extra.reply("❌ Please mention a user or reply to their message.");
      }

      await extra.reply("📸 Fetching profile picture...");

      let pp;
      try {
        pp = await sock.profilePictureUrl(target, "image");
      } catch (e) {
        return extra.reply("❌ User has no profile picture or privacy is enabled.");
      }

      await sock.sendMessage(chatId, {
        image: { url: pp },
        caption:
`📸 *PROFILE PICTURE*

👤 User: @${target.split("@")[0]}

🤖 Powered by Mathithibala_Bot
👑 Professor Sahil System`
      }, {
        quoted: msg,
        mentions: [target]
      });

    } catch (err) {
      console.log("GETPP ERROR:", err);
      extra.reply("❌ Failed to fetch profile picture.");
    }
  }
};
