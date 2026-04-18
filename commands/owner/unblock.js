 /**
  * Unblock Command - Enhanced Version
  */

module.exports = {
  name: 'unblock',
  aliases: ['unban'],
  category: 'owner',
  description: 'Unblock a user from bot',
  usage: '.unblock @user or reply',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      let target =
        ctx?.mentionedJid?.[0] ||
        ctx?.participant ||
        null;

      if (!target && ctx?.quotedMessage) {
        target = ctx.participant;
      }

      if (!target) {
        return extra.reply(
          '❌ Please mention or reply to a user to unblock!'
        );
      }

      // unblock user
      await sock.updateBlockStatus(target, 'unblock');

      await sock.sendMessage(chatId, {
        text:
`🔓 *USER UNBLOCKED*

👤 User: @${target.split('@')[0]}
⚡ Status: Unblocked successfully`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[UNBLOCK ERROR]', error);

      await extra.reply(
        `❌ Failed to unblock user:\n${error.message}`
      );
    }
  }
};
