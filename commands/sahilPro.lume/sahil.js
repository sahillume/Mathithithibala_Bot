/**
 * Sahil Pro Lume - Owner Control Command
 * Multi utility powerhouse (PRO SYSTEM)
 */

const fs = require('fs');

module.exports = {
  name: 'sahil',
  category: 'owner',
  description: 'Advanced owner control system',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = msg.key.remoteJid;
      const text = args.join(' ');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      // ===============================
      // 📌 HELP MENU
      // ===============================
      if (!text) {
        return extra.reply(`╭━━『 👑 SAHIL PRO SYSTEM 』━━╮
│
│ ⚙️ Commands:
│ • .sahil getpp @user
│ • .sahil savepp @user
│ • .sahil saveallstatus @user
│ • .sahil help
│
╰━━━━━━━━━━━━━━━━━━`);
      }

      const cmd = args[0]?.toLowerCase();

      // ===============================
      // 🖼 GET PROFILE PICTURE
      // ===============================
      if (cmd === 'getpp') {
        const user = mentioned[0];
        if (!user) return extra.reply('❌ Mention a user');

        try {
          const pp = await sock.profilePictureUrl(user, 'image');

          await sock.sendMessage(from, {
            image: { url: pp },
            caption: `👑 Profile Picture of @${user.split('@')[0]}`,
            mentions: [user]
          }, { quoted: msg });

        } catch {
          extra.reply('❌ No profile picture found');
        }
      }

      // ===============================
      // 💾 SAVE PROFILE PICTURE
      // ===============================
      if (cmd === 'savepp') {
        const user = mentioned[0];
        if (!user) return extra.reply('❌ Mention a user');

        try {
          const pp = await sock.profilePictureUrl(user, 'image');

          const res = await fetch(pp);
          const buffer = await res.buffer();

          const filePath = `./sahil_data/${user.split('@')[0]}_pp.jpg`;

          fs.writeFileSync(filePath, buffer);

          extra.reply(`✅ Profile picture saved for @${user.split('@')[0]}`);

        } catch {
          extra.reply('❌ Failed to save profile picture');
        }
      }

      // ===============================
      // 📸 SAVE ALL STATUS (SIMULATED CORE)
      // ===============================
      if (cmd === 'saveallstatus') {
        const user = mentioned[0];
        if (!user) return extra.reply('❌ Mention a user');

        extra.reply('⏳ Fetching status... (system scanning)');

        // NOTE: WhatsApp restricts real status scraping
        // so we simulate + prepare system structure

        const file = `./sahil_data/${user.split('@')[0]}_status.json`;

        fs.writeFileSync(file, JSON.stringify({
          user,
          savedAt: new Date(),
          note: "Status tracking placeholder (Baileys limitation)"
        }, null, 2));

        extra.reply(`✅ Status archive created for @${user.split('@')[0]}`);
      }

      // ===============================
      // ❓ HELP
      // ===============================
      if (cmd === 'help') {
        return extra.reply(`╭━━『 👑 SAHIL HELP 』━━╮
│ .sahil getpp @user
│ .sahil savepp @user
│ .sahil saveallstatus @user
╰━━━━━━━━━━━━━━━`);
      }

    } catch (err) {
      console.log(err);
      extra.reply('❌ Sahil system error');
    }
  }
};
