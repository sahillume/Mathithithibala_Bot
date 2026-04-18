/**
 * Block Command - Block a user (IMPROVED)
 */

module.exports = {
  name: 'block',
  aliases: [],
  category: 'owner',
  description: 'Block a user',
  usage: '.block @user or reply',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      let target =
        ctx?.mentionedJid?.[0] ||
        ctx?.participant;

      // safer fallback for reply detection
      if (!target && ctx?.quotedMessage) {
        target = ctx.participant;
      }

      if (!target) {
        return extra.reply(
          '❌ Please mention a user or reply to their message to block them.'
        );
      }

      await sock.updateBlockStatus(target, 'block');

      await sock.sendMessage(chatId, {
        text:
`🚫 *USER BLOCKED*

👤 User: @${target.split('@')[0]}
📌 Status: Blocked successfully`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('Block command error:', error);
      return extra.reply('❌ Failed to block user: ' + error.message);
    }
  }
};
