/**
 * Kick Command - Pro Version
 * Mathithibala Admin System
 */

module.exports = {
  name: 'kick',
  aliases: ['remove', 'kickuser'],
  category: 'admin',
  description: 'Remove a user from the group',
  usage: '.kick @user',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 👥 Get group metadata
      const metadata = await sock.groupMetadata(groupId);
      const participants = metadata.participants || [];
      const owner = metadata.owner;

      // 👤 Get mentioned users OR replied user
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      const replied =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      let targets = mentioned.length ? mentioned : (replied ? [replied] : []);

      if (targets.length === 0) {
        return sock.sendMessage(groupId, {
          text: `❌ Please mention or reply to a user to kick.\n\nExample:\n.kick @user`
        }, { quoted: msg });
      }

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const sender = msg.key.participant || msg.key.remoteJid;

      let success = [];
      let failed = [];

      for (const userId of targets) {

        // 🚫 Prevent self kick
        if (userId === sender) {
          failed.push(`❌ You cannot remove yourself.`);
          continue;
        }

        // 🚫 Prevent bot kick
        if (userId === botId) {
          failed.push(`❌ Cannot remove the bot.`);
          continue;
        }

        // 🚫 Prevent owner kick
        if (userId === owner) {
          failed.push(`❌ Cannot remove the group owner.`);
          continue;
        }

        // 🔍 Check if user exists
        const exists = participants.find(p => p.id === userId);
        if (!exists) {
          failed.push(`❌ @${userId.split('@')[0]} not found.`);
          continue;
        }

        try {
          await sock.groupParticipantsUpdate(groupId, [userId], 'remove');
          success.push(`✔️ @${userId.split('@')[0]}`);
        } catch (err) {
          failed.push(`❌ Failed to remove @${userId.split('@')[0]}`);
        }
      }

      // 📢 Final message
      let text = `🚫 *KICK RESULT*\n\n`;

      if (success.length) {
        text += `✅ Removed:\n${success.join('\n')}\n\n`;
      }

      if (failed.length) {
        text += `⚠️ Failed:\n${failed.join('\n')}\n\n`;
      }

      text += `👑 Action by Admin\n🤖 Mathithibala Bot`;

      await sock.sendMessage(groupId, {
        text,
        mentions: targets
      }, { quoted: msg });

    } catch (error) {
      console.error('Kick Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to kick user: ${error.message}`
      }, { quoted: msg });
    }
  }
};
