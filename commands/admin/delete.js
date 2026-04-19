/**
 * Delete - Remove a message
 * Professional version by Mathithibala Bot
 */

module.exports = {
  name: 'delete',
  aliases: ['del', 'd'],
  category: 'admin',
  desc: 'Delete a replied message',
  usage: '.delete (reply to message)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg) {
    try {
      const groupId = msg.key.remoteJid;

      // 📌 Check if replying to a message
      const quoted = msg.message?.extendedTextMessage?.contextInfo;

      if (!quoted || !quoted.stanzaId) {
        return await sock.sendMessage(groupId, {
          text: '❌ Please reply to the message you want to delete.'
        }, { quoted: msg });
      }

      // 📌 Build delete object
      const deleteMsg = {
        remoteJid: groupId,
        fromMe: quoted.participant === sock.user.id,
        id: quoted.stanzaId,
        participant: quoted.participant
      };

      // 🚀 Delete message
      await sock.sendMessage(groupId, {
        delete: deleteMsg
      });

      // ✅ Optional confirmation (silent mode recommended)
      // Uncomment if you want feedback:
      /*
      await sock.sendMessage(groupId, {
        text: '🗑️ Message deleted successfully.',
      }, { quoted: msg });
      */

    } catch (error) {
      console.error('Delete Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to delete message. Make sure I am admin and the message is valid.'
      }, { quoted: msg });
    }
  }
};
