/**
 * Tag All Command - Pro Version
 * Mathithibala Admin System
 */

const cooldown = new Map();

module.exports = {
  name: 'tagall',
  aliases: ['everyone', 'all', 'tag'],
  category: 'admin',
  description: 'Tag all group members',
  usage: '.tagall message',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      // ⏳ Anti-spam cooldown (30 sec)
      const now = Date.now();
      const cooldownTime = 30 * 1000;

      if (cooldown.has(groupId)) {
        const expire = cooldown.get(groupId);

        if (now < expire) {
          const remaining = Math.ceil((expire - now) / 1000);
          return sock.sendMessage(groupId, {
            text: `⏳ Please wait ${remaining}s before using tagall again.`
          }, { quoted: msg });
        }
      }

      cooldown.set(groupId, now + cooldownTime);

      // 👥 Fetch group participants
      const metadata = await sock.groupMetadata(groupId);
      const participants = metadata.participants || [];

      if (participants.length === 0) {
        return sock.sendMessage(groupId, {
          text: '❌ No members found.'
        }, { quoted: msg });
      }

      // 📝 Custom message
      const message = args.join(' ') || '📢 Attention everyone!';

      // 🔥 Build mention list
      let text = `📣 *TAG ALL*\n\n${message}\n\n`;

      const mentions = [];

      for (let i = 0; i < participants.length; i++) {
        const userId = participants[i].id;

        text += `👤 @${userId.split('@')[0]}\n`;
        mentions.push(userId);
      }

      text += `\n👑 Requested by Admin\n🤖 Mathithibala Bot`;

      // 🚀 Send message
      await sock.sendMessage(groupId, {
        text,
        mentions
      }, { quoted: msg });

    } catch (error) {
      console.error('TagAll Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to tag all users: ${error.message}`
      }, { quoted: msg });
    }
  }
};
