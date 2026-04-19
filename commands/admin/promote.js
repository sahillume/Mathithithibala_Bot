/**
 * Promote Command - Pro Version
 * Mathithibala Admin System
 */

module.exports = {
  name: 'promote',
  aliases: ['makeadmin', 'addadmin'],
  category: 'admin',
  description: 'Promote a user to admin',
  usage: '.promote @user',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      // 👤 Get mentioned or replied user
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      const replied =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      const userId = mentioned || replied;

      if (!userId) {
        return sock.sendMessage(groupId, {
          text: `❌ Please mention or reply to a user to promote.\n\nExample:\n.promote @user`
        }, { quoted: msg });
      }

      // 👥 Get group metadata
      const metadata = await sock.groupMetadata(groupId);
      const participants = metadata.participants || [];

      // 🔍 Check if already admin
      const isAdmin = participants.find(
        p => p.id === userId && (p.admin === 'admin' || p.admin === 'superadmin')
      );

      if (isAdmin) {
        return sock.sendMessage(groupId, {
          text: `⚠️ This user is already an admin.`
        }, { quoted: msg });
      }

      // 🚀 Promote user
      await sock.groupParticipantsUpdate(groupId, [userId], 'promote');

      // 📢 Success message
      await sock.sendMessage(groupId, {
        text: `👑 *USER PROMOTED*\n\n👤 User: @${userId.split('@')[0]}\n\n🎉 Now an admin of the group\n🤖 Mathithibala Bot`,
        mentions: [userId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Promote Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to promote user: ${error.message}`
      }, { quoted: msg });
    }
  }
};
