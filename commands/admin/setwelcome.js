/**
 * Set Welcome Message - Pro Version
 * Mathithibala Admin System
 */

const db = require('../../database');

module.exports = {
  name: 'setwelcome',
  aliases: ['welcome-msg', 'setwm'],
  category: 'admin',
  description: 'Set custom welcome message',
  usage: '.setwelcome <message>',

  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;

      if (!args.length) {
        return sock.sendMessage(groupId, {
          text:
`👋 *Set Welcome Message*

📌 Usage:
.setwelcome Welcome @user to @group 🎉

🧠 Available placeholders:
• @user  → mentions new member
• @group → group name

🔄 Reset:
.setwelcome reset`
        }, { quoted: msg });
      }

      const input = args.join(' ');

      // 🔄 RESET
      if (input.toLowerCase() === 'reset') {
        db.updateGroupSettings(groupId, {
          welcomeMessage: '👋 Welcome @user to @group 🎉'
        });

        return sock.sendMessage(groupId, {
          text: '✅ Welcome message has been reset to default.'
        }, { quoted: msg });
      }

      // 💾 Save custom message
      db.updateGroupSettings(groupId, {
        welcomeMessage: input
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
`✅ *Welcome Message Updated!*

📌 *Preview:*
${preview}

🤖 Mathithibala Bot System`,
        mentions: [fakeUser]
      }, { quoted: msg });

    } catch (error) {
      console.error('SetWelcome Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to set welcome message: ${error.message}`
      }, { quoted: msg });
    }
  }
};
