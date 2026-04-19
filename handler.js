/**
 * Message Handler - Mathithibala Pro System (ULTIMATE CORE v2)
 */

const config = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const axios = require('axios');
const db = require('./database');

// ===============================
// ⏳ COOLDOWN SYSTEM
// ===============================
const cooldowns = new Map();

// Load commands once
const commands = loadCommands();

// ===============================
// PREFIX SYSTEM
// ===============================
const getPrefixes = () => [
  config.prefix,
  '.',
  '!',
  '#',
  '/',
  '?'
];

// ===============================
// MAIN HANDLER
// ===============================
const handleMessage = async (sock, msg) => {
  try {
    if (!msg?.message) return;

    const from = msg.key.remoteJid;

    const sender = msg.key.fromMe
      ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
      : msg.key.participant || msg.key.remoteJid;

    const isGroup = from.endsWith('@g.us');

    // ===============================
    // TEXT EXTRACTION (SAFE)
    // ===============================
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    const text = (body || '').trim();

    const prefixes = getPrefixes();
    const hasPrefix = prefixes.some(p => text.startsWith(p));

    // ===============================
    // GROUP SETTINGS (SAFE LOAD)
    // ===============================
    let groupSettings = {};

    if (isGroup) {
      try {
        groupSettings = db.getGroupSettings(from) || {};
      } catch {
        groupSettings = {};
      }
    }

    // ===============================
    // 🚫 ANTI-LINK SYSTEM
    // ===============================
    if (isGroup && groupSettings.antilink) {
      const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi;

      if (linkRegex.test(text)) {
        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
        return sock.sendMessage(from, {
          text: '🚫 Anti-Link Activated\nLinks are not allowed here.',
          quoted: msg
        });
      }
    }

    // ===============================
    // 🚫 ANTI TAG / MENTION SPAM
    // ===============================
    if (isGroup && groupSettings.antitag) {
      const mentions =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length >= 5) {
        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
        return sock.sendMessage(from, {
          text: '🚫 Anti-Tag Activated\nMass tagging is not allowed.',
          quoted: msg
        });
      }
    }

    if (isGroup && groupSettings.antigroupmention) {
      const mentions =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length >= 5) {
        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
        return sock.sendMessage(from, {
          text: '🚫 Anti-Group-Mention Activated\nSpam mentioning blocked.',
          quoted: msg
        });
      }
    }

    // ===============================
    // 🤖 AI AUTO REPLY (ONLY NON PREFIX)
    // ===============================
    if (!hasPrefix && !msg.key.fromMe && config.aiMode) {
      try {
        const res = await axios.get(
          `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(text)}&botname=${config.botName}&ownername=${config.ownerName}`
        );

        if (res?.data?.message) {
          return sock.sendMessage(from, {
            text: `🤖 ${res.data.message}`
          }, { quoted: msg });
        }
      } catch (e) {
        console.log('AI Error:', e.message);
      }
    }

    // ===============================
    // OWNER CHECK
    // ===============================
    const isOwner = checkOwner(sender);

    if (!isOwner) {
      const blockedWords = ['setname', 'setpp', 'setbio'];

      if (blockedWords.some(w => text.toLowerCase().includes(w))) {
        return sock.sendMessage(from, {
          text: '❌ Only Professor Sahil can change bot identity.'
        }, { quoted: msg });
      }
    }

    // ===============================
    // PREFIX VALIDATION
    // ===============================
    const usedPrefix = prefixes.find(p => text.startsWith(p));
    if (!usedPrefix) return;

    // ===============================
    // COMMAND PARSING
    // ===============================
    const args = text.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    // ===============================
    // COOLDOWN SYSTEM
    // ===============================
    const now = Date.now();
    const key = sender + commandName;

    if (cooldowns.has(key) && now - cooldowns.get(key) < 3000) {
      return sock.sendMessage(from, {
        text: '⏳ Slow down... wait a moment.'
      }, { quoted: msg });
    }

    cooldowns.set(key, now);

    // ===============================
    // OWNER ONLY CHECK
    // ===============================
    if (command.ownerOnly && !isOwner) {
      return sock.sendMessage(from, {
        text: '❌ Owner only command.'
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
