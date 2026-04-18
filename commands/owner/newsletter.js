/**
 * Newsletter Command - Get WhatsApp Channel Info
 * Improved version (clean + stable + flexible input)
 */

function extractChannelCode(input = '') {
  try {
    let text = input.trim().split('?')[0].split('#')[0];

    // full URL support
    const urlMatch = text.match(/channel\/([A-Za-z0-9]+)/i);
    if (urlMatch) return urlMatch[1];

    // direct code support
    if (/^[A-Za-z0-9]+$/.test(text)) return text;

    return null;
  } catch {
    return null;
  }
}

module.exports = {
  name: 'newsletter',
  aliases: ['nl', 'channelinfo', 'channel'],
  category: 'owner',
  description: 'Get WhatsApp channel (newsletter) information',
  usage: '.newsletter <link or invite code>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      const input =
        args.join(' ').trim() ||
        msg.message?.extendedTextMessage?.text?.split(' ').slice(1).join(' ').trim();

      if (!input) {
        return extra.reply(
          `❌ *Usage:* .newsletter <channel link or code>\n\n` +
          `Example:\n` +
          `• .newsletter https://whatsapp.com/channel/XXXX\n` +
          `• .newsletter XXXX`
        );
      }

      const code = extractChannelCode(input);

      if (!code) {
        return extra.reply('❌ Invalid channel link or code!');
      }

      // fetch metadata
      const meta = await sock.newsletterMetadata('invite', code);

      if (!meta) {
        return extra.reply('❌ Channel not found or invalid invite code!');
      }

      let text =
`📰 *CHANNEL INFO*

🆔 ID: ${meta.id || 'N/A'}
👥 Subscribers: ${meta.subscriberCount?.toLocaleString?.() || 'N/A'}
📅 Created: ${meta.creationTime ? new Date(meta.creationTime * 1000).toLocaleString() : 'N/A'}`;

      if (meta.description) {
        text += `\n\n📝 Description:\n${meta.description}`;
      }

      if (meta.invite) {
        text += `\n\n🔗 Invite:\n${meta.invite}`;
      }

      if (meta.image) {
        await sock.sendMessage(chatId, {
          image: { url: meta.image },
          caption: text
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, {
          text
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('Newsletter error:', error);
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
