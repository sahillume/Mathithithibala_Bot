/**
 * Group Status - Open/Close group chat
 * Professional version by Mathithibala Bot
 */

module.exports = {
  name: 'groupstatus',
  aliases: ['gc', 'group', 'open', 'close'],
  category: 'admin',
  desc: 'Open or close the group',
  usage: '.groupstatus open/close',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      // 📌 Fetch group metadata
      const metadata = await sock.groupMetadata(groupId);

      if (!metadata) {
        return await sock.sendMessage(groupId, {
          text: '❌ Failed to fetch group information.'
        }, { quoted: msg });
      }

      const isClosed = metadata.announce === true;

      // 📊 SHOW STATUS (no args)
      if (!action) {
        const statusText = isClosed
          ? '🔒 *Closed* (Only admins can send messages)'
          : '🔓 *Open* (Everyone can send messages)';

        return await sock.sendMessage(groupId, {
          text: `╭━━『 ⚙️ *GROUP STATUS* 』━━╮

📛 *Name:* ${metadata.subject}
👥 *Members:* ${metadata.participants.length}

📊 *Status:* ${statusText}

📌 *Commands:*
• .groupstatus open
• .groupstatus close

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      // 🔓 OPEN GROUP
      if (action === 'open') {
        if (!isClosed) {
          return await sock.sendMessage(groupId, {
            text: '⚠️ Group is already open.'
          }, { quoted: msg });
        }

        await sock.groupSettingUpdate(groupId, 'not_announcement');

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🔓 *GROUP OPENED* 』━━╮

✅ Everyone can now send messages.

╰━━━━━━━━━━━━━━━━━
👑 Opened by admin
🤖 ${require('../../config').botName}`
        }, { quoted: msg });
      }

      // 🔒 CLOSE GROUP
      if (action === 'close') {
        if (isClosed) {
          return await sock.sendMessage(groupId, {
            text: '⚠️ Group is already closed.'
          }, { quoted: msg });
        }

        await sock.groupSettingUpdate(groupId, 'announcement');

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🔒 *GROUP CLOSED* 』━━╮

🚫 Only admins can send messages now.

╰━━━━━━━━━━━━━━━━━
👑 Closed by admin
🤖 ${require('../../config').botName}`
        }, { quoted: msg });
      }

      // ❌ INVALID INPUT
      return await sock.sendMessage(groupId, {
        text: '❌ Invalid option.\nUse: .groupstatus open OR .groupstatus close'
      }, { quoted: msg });

    } catch (error) {
      console.error('GroupStatus Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to update group status. Make sure I am admin.'
      }, { quoted: msg });
    }
  }
};
