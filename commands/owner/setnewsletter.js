const fs = require('fs');
const path = require('path');
const config = require('../../config');

/**
 * SetNewsletter Command - Owner only
 * Set or change newsletter JID for menu forwarding
 */

module.exports = {
  name: 'setnewsletter',
  aliases: ['setnl', 'setchannel'],
  category: 'owner',
  description: 'Set or change newsletter JID for menu forwarding',
  usage: '.setnewsletter <newsletter JID>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      let newsletterJid = '';

      const chatId = extra.from;

      // ===============================
      // 1. Detect from current chat
      // ===============================
      if (msg.key.remoteJid?.endsWith('@newsletter')) {
        newsletterJid = msg.key.remoteJid;
      }

      // ===============================
      // 2. Detect from reply
      // ===============================
      else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        const ctx = msg.message.extendedTextMessage.contextInfo;

        const findJid = (obj, depth = 0) => {
          if (!obj || typeof obj !== 'object' || depth > 6) return null;

          for (const key in obj) {
            const val = obj[key];

            if (typeof val === 'string' && val.endsWith('@newsletter')) {
              return val;
            }

            if (typeof val === 'object') {
              const found = findJid(val, depth + 1);
              if (found) return found;
            }
          }
          return null;
        };

        newsletterJid = findJid(ctx);

        if (!newsletterJid) {
          return extra.reply(
            '❌ Please reply to a valid newsletter message.'
          );
        }
      }

      // ===============================
      // 3. From arguments
      // ===============================
      else if (args[0]) {
        newsletterJid = args[0].trim();
      }

      // ===============================
      // 4. Show current config
      // ===============================
      else {
        return extra.reply(
          `📰 *Newsletter System*\n\n` +
          `Current JID: ${config.newsletterJid || 'Not set'}\n\n` +
          `Usage:\n` +
          `.setnewsletter <jid>\n` +
          `or reply to a newsletter message\n\n` +
          `Example:\n` +
          `120363161513685998@newsletter`
        );
      }

      // ===============================
      // VALIDATE JID
      // ===============================
      if (!newsletterJid.endsWith('@newsletter')) {
        return extra.reply(
          '❌ Invalid newsletter JID!\nMust end with @newsletter'
        );
      }

      // ===============================
      // UPDATE CONFIG FILE SAFELY
      // ===============================
      const configPath = path.join(__dirname, '../../config.js');
      let configFile = fs.readFileSync(configPath, 'utf8');

      if (configFile.includes('newsletterJid')) {
        configFile = configFile.replace(
          /newsletterJid\s*:\s*['"`].*?['"`]/,
          `newsletterJid: '${newsletterJid}'`
        );
      } else {
        configFile = configFile.replace(
          /(sessionName\s*:\s*['"`].*?['"`],?)/,
          `$1\n  newsletterJid: '${newsletterJid}',`
        );
      }

      fs.writeFileSync(configPath, configFile, 'utf8');

      // ===============================
      // UPDATE RUNTIME CONFIG
      // ===============================
      config.newsletterJid = newsletterJid;

      // ===============================
      // SUCCESS MESSAGE
      // ===============================
      return extra.reply(
        `✅ *Newsletter Updated*\n\n` +
        `📡 JID: ${newsletterJid}\n` +
        `🤖 Bot: ${config.botName}\n\n` +
        `Menu forwarding is now active from this newsletter.`
      );

    } catch (error) {
      console.error('SetNewsletter error:', error);
      return extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
