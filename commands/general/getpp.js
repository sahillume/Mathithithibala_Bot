/**
 * GetPP Command - FIXED VERSION
 */

module.exports = {
  name: "getpp",
  aliases: ["pp", "profilepic", "avatar"],
  category: "general",
  description: "Get WhatsApp profile picture of a user",
  usage: ".getpp @user or reply",

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      // ===============================
      // 🧠 PROPER TARGET RESOLUTION
      // ===============================
      const context = msg.message?.extendedTextMessage?.contextInfo;

      let target =
        context?.mentionedJid?.[0] || // @mention
        context?.participant ||       // reply target
        msg.message?.extendedTextMessage?.contextInfo?.remoteJid ||
        msg.key.participant ||        // group sender
        msg.key.remoteJid;            // fallback

      // ❌ FIX: prevent bot self fallback
      if (target === sock.user.id) {
        return extra.reply("❌ You cannot fetch bot profile picture.");
      }

      if (!target || target === chatId) {
        return extra.reply("❌ Please mention or reply to a user.");
      }

      await extra.reply("📸 Fetching profile picture...");

      let pp;
      try {
        pp = await sock.profilePictureUrl(target, "image");
      } catch (e) {
        return extra.reply("❌ User has no profile picture or it's private.");
      }

      await sock.sendMessage(chatId, {
        image: { url: pp },
        caption:
`📸 *PROFILE PICTURE*

👤 User: @${target.split("@")[0]}

🤖 Mathithibala_Bot
👑 Professor Sahil`
      }, {
        quoted: msg,
        mentions: [target]
      });

    } catch (err) {
      console.log("GETPP ERROR:", err.message);
      extra.reply("❌ Failed to fetch profile picture.");
    }
  }
};
