/**
 * Set Goodbye Message - Pro Version
 * Mathithibala Admin System
 */

const db = require('../../database');

module.exports = {
  name: 'setgoodbye',
  aliases: ['goodbye-msg', 'setgb'],
  category: 'admin',
  description: 'Set custom goodbye message',
  usage: '.setgoodbye <message>',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      if (!args.length) {
        return sock.sendMessage(groupId, {
          text:
`👋 *Set Goodbye Message*

📌 Usage:
.setgoodbye Goodbye @user 👋 we will miss you in @group

🧠 Available placeholders:
• @user  → mentions leaving member
• @group → group name

🔄 Reset:
.setgoodbye reset`
        }, { quoted: msg });
      }

      const input = args.join(' ');

      // 🔄 RESET
      if (input.toLowerCase() === 'reset') {
        db.updateGroupSettings(groupId, {
          goodbyeMessage: '👋 Goodbye @user, we will miss you at @group'
        });

        return sock.sendMessage(groupId, {
          text: '✅ Goodbye message has been reset to default.'
        }, { quoted: msg });
      }

      // 💾 Save custom message
      db.updateGroupSettings(groupId, {
        goodbyeMessage: input
      });

      // 👥 Get group name for preview
      const metadata = await sock.groupMetadata(groupId);
      const groupName = metadata.subject;

      // 👤 Fake preview user
      const fakeUser = msg.key.participant || msg.key.remoteJid;

      // 🔮 Generate preview
      let preview = input
        .replace(/@user/g, `@${fakeUser.split('@')[0]}`)
        .replace(/@group/g, groupName);

      await sock.sendMessage(groupId, {
        text:
`✅ *Goodbye Message Updated!*

📌 *Preview:*
${preview}

🤖 Mathithibala Bot System`,
        mentions: [fakeUser]
      }, { quoted: msg });

    } catch (error) {
      console.error('SetGoodbye Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to set goodbye message: ${error.message}`
      }, { quoted: msg });
    }
  }
};
