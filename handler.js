/**
 * Message Handler - Sahil Pro System (Multi-Prefix Edition)
 */

const config = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const axios = require('axios');

// ===============================
// ⏳ COOLDOWN SYSTEM
// ===============================
const cooldowns = new Map();

// Load commands
const commands = loadCommands();

// ===============================
// MULTI PREFIX SUPPORT
// ===============================
const getPrefixes = () => {
  // Default prefixes + custom prefix from config
  return [
    config.prefix,
    '.',
    '!',
    '#',
    '/',
    '?'
  ];
};

// ===============================
// MAIN HANDLER
// ===============================
const handleMessage = async (sock, msg) => {
  try {
    if (!msg.message) return;

    const from = msg.key.remoteJid;

    const sender = msg.key.fromMe
      ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
      : msg.key.participant || msg.key.remoteJid;

    const isGroup = from.endsWith('@g.us');

    // ===============================
    // EXTRACT TEXT
    // ===============================
    let body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    body = (body || '').trim();

    // ===============================
    // 👑 OWNER CHECK
    // ===============================
    const isOwner = checkOwner(sender);

    // ===============================
    // 🤖 AI AUTO REPLY
    // ===============================
    const prefixes = getPrefixes();

    const hasPrefix = prefixes.some(p => body.startsWith(p));

    if (!hasPrefix && !msg.key.fromMe) {
      if (config.aiMode) {
        try {
          const res = await axios.get(
            `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(body)}&botname=${config.botName}&ownername=${config.ownerName}`
          );

          await sock.sendMessage(from, {
            text: `🤖 ${res.data.message}`
          }, { quoted: msg });

          return;
        } catch (e) {
          console.log('AI Error:', e.message);
        }
      }
    }

    // ===============================
    // 🔒 OWNER PROTECTION
    // ===============================
    if (!isOwner) {
      if (
        body.toLowerCase().includes('setname') ||
        body.toLowerCase().includes('setpp') ||
        body.toLowerCase().includes('setbio')
      ) {
        return sock.sendMessage(from, {
          text: '❌ Only Professor Sahil can change bot identity.'
        }, { quoted: msg });
      }
    }

    // ===============================
    // CHECK PREFIX MATCH
    // ===============================
    let usedPrefix = null;

    for (const p of prefixes) {
      if (body.startsWith(p)) {
        usedPrefix = p;
        break;
      }
    }

    if (!usedPrefix) return;

    // ===============================
    // PARSE COMMAND
    // ===============================
    const args = body.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    // ===============================
    // ⏳ COOLDOWN PER USER
    // ===============================
    const now = Date.now();
    const key = sender + commandName;
    const last = cooldowns.get(key) || 0;

    if (now - last < 3000) {
      return sock.sendMessage(from, {
        text: '⏳ Slow down, wait a moment...'
      }, { quoted: msg });
    }

    cooldowns.set(key, now);

    // ===============================
    // OWNER-ONLY COMMAND
    // ===============================
    if (command.ownerOnly && !isOwner) {
      return sock.sendMessage(from, {
        text: '❌ This command is only for the owner.'
      }, { quoted: msg });
    }

    // ===============================
    // EXECUTE COMMAND
    // ===============================
    await command.execute(sock, msg, args, {
      from,
      sender,
      isGroup,
      isOwner,
      config,

      reply: (text) =>
        sock.sendMessage(from, { text }, { quoted: msg })
    });

  } catch (err) {
    console.error('Handler Error:', err);
  }
};

// ===============================
// OWNER CHECK FUNCTION
// ===============================
const checkOwner = (sender) => {
  if (!sender) return false;

  const number = sender.split('@')[0];
  return config.ownerNumbers.includes(number);
};

module.exports = {
  handleMessage
};
