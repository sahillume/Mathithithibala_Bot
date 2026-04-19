/**
 * HideTag - Mention all members silently
 * Professional version by Mathithibala Bot
 */

module.exports = {
  name: 'hidetag',
  aliases: ['ht', 'taghidden', 'silenttag'],
  category: 'admin',
  desc: 'Mention all group members without showing mentions',
  usage: '.hidetag <message>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 📌 Get group metadata
      const metadata = await sock.groupMetadata(groupId);
      const participants = metadata.participants || [];

      if (!participants.length) {
        return await sock.sendMessage(groupId, {
          text: '❌ Unable to fetch group members.'
        }, { quoted: msg });
      }

      // 👥 Extract all member IDs
      const mentions = participants.map(p => p.id);

      // 💬 Message content
      let text;

      // If replying to a message → use that message
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        text = msg.message.extendedTextMessage.contextInfo.quotedMessage?.conversation ||
               msg.message.extendedTextMessage.contextInfo.quotedMessage?.extendedTextMessage?.text ||
               '';
      } else {
        text = args.join(' ');
      }

      // Default message
      if (!text) {
        text = `📢 *Attention everyone!*\n\n👑 Message from admin`;
      }

      // ✨ Final styled message
      const finalMessage = `╭━━『 📢 *GROUP NOTICE* 』━━╮

${text}

╰━━━━━━━━━━━━━━━━━
👑 *Mathithibala Bot*
🤖 Powered by *Professor Sahil*`;

      // 🚀 Send hidden tag message
      await sock.sendMessage(groupId, {
        text: finalMessage,
        mentions: mentions
      }, { quoted: msg });

    } catch (error) {
      console.error('HideTag Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to tag members silently. Please try again.'
      }, { quoted: msg });
    }
  }
};
