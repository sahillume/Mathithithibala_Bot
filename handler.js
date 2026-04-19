/**
 * Message Handler - Mathithibala Pro System (FULL UPGRADED CORE)
 */

const config = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const axios = require('axios');
const db = require('./database'); // 👈 IMPORTANT ADDED

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

    const prefixes = getPrefixes();
    const hasPrefix = prefixes.some(p => body.startsWith(p));

    // ===============================
    // GROUP SETTINGS LOAD
    // ===============================
    let groupSettings = null;

    if (isGroup) {
      try {
        groupSettings = db.getGroupSettings(from);
      } catch (e) {
        groupSettings = {};
      }
    }

    // ===============================
    // 🚫 ANTI-LINK SYSTEM
    // ===============================
    if (isGroup && groupSettings?.antilink) {
      const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi;

      if (linkRegex.test(body)) {
        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
        return sock.sendMessage(from, {
          text: '🚫 Anti-Link System Activated\n\nLinks are not allowed in this group.',
          quoted: msg
        });
      }
    }

    // ===============================
    // 🚫 ANTI-TAG SYSTEM
    // ===============================
    if (isGroup && groupSettings?.antitag) {
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length >= 5) {
        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
        return sock.sendMessage(from, {
          text: '🚫 Anti-Tag System Activated\n\nMass tagging is not allowed.',
          quoted: msg
        });
      }
    }

    // ===============================
    // 🚫 ANTI GROUP MENTION SYSTEM
    // ===============================
    if (isGroup && groupSettings?.antigroupmention) {
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length >= 5) {
        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
        return sock.sendMessage(from, {
          text: '🚫 Anti-Group-Mention Activated\n\nSpam mentioning is blocked.',
          quoted: msg
        });
      }
    }

    // ===============================
    // 👋 WELCOME / GOODBYE HOOK PLACEHOLDER
    // ===============================
    // (You will connect this in group participant update event)
    // kept here for structure consistency

    // ===============================
    // 🤖 AI AUTO REPLY (ONLY IF NO PREFIX)
    // ===============================
    if (!hasPrefix && !msg.key.fromMe && config.aiMode) {
      try {
        const res = await axios.get(
          `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(body)}&botname=${config.botName}&ownername=${config.ownerName}`
        );

        return sock.sendMessage(from, {
          text: `🤖 ${res.data.message}`
        }, { quoted: msg });

      } catch (e) {
        console.log('AI Error:', e.message);
      }
    }

    // ===============================
    // OWNER PROTECTION
    // ===============================
    const isOwner = checkOwner(sender);

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
    // PREFIX CHECK
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
    // ⏳ COOLDOWN SYSTEM
    // ===============================
    const now = Date.now();
    const key = sender + commandName;
    const last = cooldowns.get(key) || 0;

    if (now - last < 3000) {
      return sock.sendMessage(from, {
        text: '⏳ Please wait...'
      }, { quoted: msg });
    }

    cooldowns.set(key, now);

    // ===============================
    // OWNER ONLY CHECK
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
      db,

      reply: (text) =>
        sock.sendMessage(from, { text }, { quoted: msg })
    });

  } catch (err) {
    console.error('Handler Error:', err);
  }
};

// ===============================
// OWNER CHECK
// ===============================
const checkOwner = (sender) => {
  if (!sender) return false;

  const number = sender.split('@')[0];
  return config.ownerNumbers.includes(number);
};

module.exports = {
  handleMessage
};
