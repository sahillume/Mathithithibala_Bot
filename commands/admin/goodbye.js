/**
 * Goodbye Handler - Stable Version
 * Mathithibala Bot (Fixed by Sahil)
 */

const db = require('../../database');

module.exports = async (sock, update) => {
  try {

    // 🧠 Safe extraction (Baileys compatible)
    const id = update?.id || update?.jid;
    const participants = update?.participants || [];
    const action = update?.action;

    // ❌ Ignore invalid or startup events
    if (!id || !participants.length || action !== 'remove') return;

    const groupSettings = db.getGroupSettings(id);

    // ❌ If goodbye disabled
    if (!groupSettings?.goodbye) return;

    // 📌 Get group info safely
    let metadata;
    try {
      metadata = await sock.groupMetadata(id);
    } catch {
      return;
    }

    const groupName = metadata?.subject || 'this group';

    for (const user of participants) {

      const userTag = `@${user.split('@')[0]}`;

      // 💬 Message template
      let message =
        groupSettings?.goodbyeMessage ||
        `👋 Goodbye ${userTag}

We are sad to see you leave *${groupName}* 💔

👑 Mathithibala Bot
🤖 Powered by Professor Sahil`;

      // Replace placeholders safely
      message = message
        .replace(/@user/gi, userTag)
        .replace(/@group/gi, groupName);

      // 🚀 Send goodbye message
      await sock.sendMessage(id, {
        text: `╭━━『 👋 GOODBYE 』━━╮

${message}

╰━━━━━━━━━━━━━━━━━`,
        mentions: [user]
      });
    }

  } catch (error) {
    console.log('Goodbye Handler Error:', error.message || error);
  }
};
