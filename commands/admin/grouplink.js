/**
 * Group Link - Get or reset group invite link
 * Professional version by Mathithibala Bot
 */

module.exports = {
  name: 'grouplink',
  aliases: ['link', 'invite', 'gclink'],
  category: 'admin',
  desc: 'Get or reset group invite link',
  usage: '.grouplink [reset]',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args) {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

      // 📌 RESET LINK
      if (action === 'reset') {
        await sock.groupRevokeInvite(groupId);

        // Get new link after reset
        const newCode = await sock.groupInviteCode(groupId);
        const newLink = `https://chat.whatsapp.com/${newCode}`;

        return await sock.sendMessage(groupId, {
          text: `╭━━『 🔄 *GROUP LINK RESET* 』━━╮

✅ Old link has been revoked!
🔗 *New Link:*
${newLink}

⚠️ Only share with trusted members.

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
        }, { quoted: msg });
      }

      // 📎 GET CURRENT LINK
      const code = await sock.groupInviteCode(groupId);
      const link = `https://chat.whatsapp.com/${code}`;

      await sock.sendMessage(groupId, {
        text: `╭━━『 🔗 *GROUP INVITE LINK* 』━━╮

📎 *Link:*
${link}

📌 *Tip:*
Use *.grouplink reset* to revoke old link.

╰━━━━━━━━━━━━━━━━━
👑 Mathithibala Bot
🤖 Powered by Professor Sahil`
      }, { quoted: msg });

    } catch (error) {
      console.error('GroupLink Error:', error);

      let errorMsg = '❌ Failed to get group link.';

      if (error?.message?.includes('not-authorized')) {
        errorMsg = '❌ I need to be admin to manage group links.';
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: errorMsg
      }, { quoted: msg });
    }
  }
};
