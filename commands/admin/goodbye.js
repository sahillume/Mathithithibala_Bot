/**
 * Goodbye Handler - Sends message when a member leaves
 * Professional version by Mathithibala Bot
 */

const db = require('../../database');

module.exports = async (sock, update) => {
  try {
    const { id, participants, action } = update;

    // Only run when someone leaves or is removed
    if (action !== 'remove') return;

    const groupSettings = db.getGroupSettings(id);

    // ❌ If goodbye disabled → do nothing
    if (!groupSettings?.goodbye) return;

    // 📌 Get group metadata
    const metadata = await sock.groupMetadata(id);
    const groupName = metadata.subject;

    for (const user of participants) {
      const userTag = `@${user.split('@')[0]}`;

      // 💬 Default goodbye message
      let message = groupSettings.goodbyeMessage ||
        `👋 Goodbye ${userTag}

We are sad to see you leave *${groupName}* 💔

👑 Mathithibala Bot
🤖 Powered by Professor Sahil`;

      // Replace placeholders
      message = message
        .replace(/@user/gi, userTag)
        .replace(/@group/gi, groupName);

      // 🚀 Send message
      await sock.sendMessage(id, {
        text: `╭━━『 👋 *GOODBYE* 』━━╮

${message}

╰━━━━━━━━━━━━━━━━━`,
        mentions: [user]
      });
    }

  } catch (error) {
    console.error('Goodbye Handler Error:', error);
  }
};
