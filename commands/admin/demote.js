/**
 * Demote - Remove admin privileges
 * Professional version by Mathithibala Bot
 */

module.exports = {
  name: 'demote',
  aliases: ['deadmin', 'removeadmin'],
  category: 'admin',
  desc: 'Demote a group admin',
  usage: '.demote @user / reply to user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 📌 Get group metadata
      const metadata = await sock.groupMetadata(groupId);
      const participants = metadata.participants;

      // 📌 Get bot ID
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      // 📌 Extract mentioned users or reply target
      let targets = [];

      // Mentions
      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        targets = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }

      // Reply
      else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        targets = [msg.message.extendedTextMessage.contextInfo.participant];
      }

      if (!targets.length) {
        return await sock.sendMessage(groupId, {
          text: '❌ Tag or reply to a user to demote.'
        }, { quoted: msg });
      }

      let success = [];
      let failed = [];

      for (const user of targets) {
        const participant = participants.find(p => p.id === user);

        if (!participant) {
          failed.push(user);
          continue;
        }

        // ❌ Prevent demoting owner
        if (participant.admin === 'superadmin') {
          failed.push(user);
          continue;
        }

        // ❌ Prevent demoting bot
        if (user === botId) {
          failed.push(user);
          continue;
        }

        try {
          await sock.groupParticipantsUpdate(groupId, [user], 'demote');
          success.push(user);
        } catch (err) {
          failed.push(user);
        }
      }

      // 🧾 Format mentions
      const formatUsers = (list) =>
        list.map(u => `@${u.split('@')[0]}`).join(', ');

      let text = `╭━━『 🔻 *DEMOTION RESULT* 』━━╮\n\n`;

      if (success.length) {
        text += `✅ *Demoted:*\n${formatUsers(success)}\n\n`;
      }

      if (failed.length) {
        text += `❌ *Failed:*\n${formatUsers(failed)}\n\n`;
      }

      text += `╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`;

      await sock.sendMessage(groupId, {
        text,
        mentions: [...success, ...failed]
      }, { quoted: msg });

    } catch (error) {
      console.error('Demote Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to demote user(s). Make sure I am admin.'
      }, { quoted: msg });
    }
  }
};
