/**
 * Group Info Command - Advanced Group Intelligence Panel
 * Mathithibala_Bot Pro | Professor Sahil System
 */

module.exports = {
  name: 'groupinfo',
  aliases: ['ginfo', 'info', 'groupdetails'],
  category: 'general',
  description: 'Shows detailed information about the group',
  usage: '.groupinfo',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      if (!chatId.endsWith('@g.us')) {
        return extra.reply('❌ This command only works in groups.');
      }

      const metadata = await sock.groupMetadata(chatId);

      const participants = metadata.participants || [];
      const admins = participants.filter(p => p.admin);

      const groupSettings = metadata.desc || 'No description set';

      const creationDate = metadata.creation
        ? new Date(metadata.creation * 1000).toLocaleString()
        : 'Unknown';

      const info =
`👥 *GROUP INFORMATION PANEL*

━━━━━━━━━━━━━━━━━━
📛 Name: ${metadata.subject}
🆔 Group ID: ${metadata.id}

👑 Owner: @${metadata.owner?.split('@')[0] || 'Unknown'}

👥 Members: ${participants.length}
🛡️ Admins: ${admins.length}

📅 Created: ${creationDate}

📝 Description:
${groupSettings}

━━━━━━━━━━━━━━━━━━
🤖 Bot: Mathithibala_Bot
👨‍🏫 System: Professor Sahil Pro Engine`;

      await sock.sendMessage(chatId, {
        text: info,
        mentions: metadata.owner ? [metadata.owner] : []
      }, { quoted: msg });

    } catch (err) {
      console.log('GROUPINFO ERROR:', err);
      extra.reply('❌ Could not load group information.');
    }
  }
};
