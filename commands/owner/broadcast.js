/**
 * Broadcast Command - Send message to all groups/chats (UPGRADED)
 */

module.exports = {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Broadcast message to all groups',
  usage: '.broadcast <message>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      if (!args.length) {
        return extra.reply(
          `❌ Usage: .broadcast <message>\n\n` +
          `Example:\n.broadcast Hello everyone!`
        );
      }

      const message = args.join(' ');

      await extra.reply('📡 Broadcasting message... please wait');

      const chats = await sock.groupFetchAllParticipating();
      const groups = Object.values(chats);

      let success = 0;
      let failed = 0;

      for (const group of groups) {
        try {
          await sock.sendMessage(group.id, {
            text:
`📢 *BROADCAST MESSAGE*

${message}

━━━━━━━━━━━━━━
🤖 Sent by Bot Owner`
          });

          success++;
        } catch (err) {
          failed++;
        }
      }

      // final report
      await sock.sendMessage(chatId, {
        text:
`✅ *BROADCAST COMPLETE*

📤 Sent: ${success}
❌ Failed: ${failed}
📊 Total Groups: ${groups.length}`
      }, { quoted: msg });

    } catch (error) {
      console.error('Broadcast error:', error);
      await extra.reply('❌ Broadcast failed: ' + error.message);
    }
  }
};
