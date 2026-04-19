/**
 * Group Status Command - Advanced Group Info Viewer
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: 'groupstatus',
  aliases: ['gstatus', 'groupinfo', 'ginfo'],
  category: 'general',
  description: 'Shows detailed group information',
  usage: '.groupstatus',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      if (!chatId.endsWith('@g.us')) {
        return extra.reply('❌ This command only works in groups.');
      }

      const metadata = await sock.groupMetadata(chatId);

      const participants = metadata.participants || [];
      const admins = participants.filter(p => p.admin);
      const owner = metadata.owner || 'Unknown';

      const groupInfo =
`👥 *GROUP STATUS DASHBOARD*

━━━━━━━━━━━━━━━━━━
📛 Name: ${metadata.subject}
🆔 Group ID: ${metadata.id}

👑 Owner: @${owner.split('@')[0]}
👥 Members: ${participants.length}
🛡️ Admins: ${admins.length}

📅 Created: ${new Date(metadata.creation * 1000).toLocaleString()}

━━━━━━━━━━━━━━━━━━
🤖 Bot: Mathithibala_Bot
👨‍🏫 System: Professor Sahil Pro`;

      await sock.sendMessage(chatId, {
        text: groupInfo,
        mentions: [owner]
      }, { quoted: msg });

    } catch (err) {
      console.log('GROUPSTATUS ERROR:', err);
      extra.reply('❌ Failed to fetch group status.');
    }
  }
};
