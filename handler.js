/**
 * 🔥 PRO MESSAGE HANDLER - Mathithibala_Bot (SAHIL SYSTEM FINAL)
 */

const config = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const { getGroupSettings } = require('./database');
const axios = require('axios');

const cooldowns = new Map();
const commands = loadCommands();

// ===============================
// PREFIX SYSTEM
// ===============================
const getPrefixes = () => [
  config.prefix,
  '.', '!', '#', '/', '?'
];

// ===============================
// OWNER CHECK
// ===============================
const isOwner = (sender = '') => {
  const number = sender.split('@')[0];
  return (config.ownerNumbers || []).includes(number);
};

// ===============================
// MAIN HANDLER
// ===============================
const handleMessage = async (sock, msg) => {
  try {
    if (!msg?.message) return;

    const from = msg.key.remoteJid;

    const sender =
      msg.key.fromMe
        ? sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
        : msg.key.participant ||
          msg.participant ||
          msg.key.remoteJid;

    if (!sender) return;

    const isGroup = from.endsWith('@g.us');

    // ===============================
    // GROUP SETTINGS (ANTI DELETE CONTROL)
    // ===============================
    const groupSettings = isGroup
      ? getGroupSettings(from)
      : config.defaultGroupSettings;

    // ===============================
    // EXTRACT MESSAGE BODY
    // ===============================
    let body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    body = (body || '').trim();
    if (!body) return;

    const prefixes = getPrefixes();
    const usedPrefix = prefixes.find(p => body.startsWith(p));

    const owner = isOwner(sender);

    // ===============================
    // 🤖 AI AUTO REPLY (FIXED)
    // ===============================
    if (!usedPrefix && !msg.key.fromMe && config.ai?.enabled) {
      try {
        const res = await axios.get(
          `https://api.affiliateplus.xyz/api/chatbot`,
          {
            params: {
              message: body,
              botname: config.botName,
              ownername: config.ownerName
            }
          }
        );

        if (res?.data?.message) {
          return sock.sendMessage(from, {
            text: `🤖 ${res.data.message}`
          }, { quoted: msg });
        }
      } catch {}
    }

    if (!usedPrefix) return;

    // ===============================
    // COMMAND PARSING
    // ===============================
    const args = body.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = (args.shift() || '').toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    // ===============================
    // COOLDOWN SYSTEM
    // ===============================
    const key = sender + commandName;
    const now = Date.now();
    const last = cooldowns.get(key) || 0;

    const cooldownTime = command.cooldown || 3000;

    if (now - last < cooldownTime) {
      return sock.sendMessage(from, {
        text: '⏳ Please wait before using this command.'
      }, { quoted: msg });
    }

    cooldowns.set(key, now);

    // ===============================
    // OWNER PROTECTION
    // ===============================
    if (command.ownerOnly && !owner) {
      return sock.sendMessage(from, {
        text: '❌ Owner only command.'
      }, { quoted: msg });
    }

    // ===============================
    // ADMIN CHECK (OPTIONAL)
    // ===============================
    if (command.adminOnly && isGroup) {
      const metadata = await sock.groupMetadata(from);
      const admins = metadata.participants
        .filter(p => p.admin)
        .map(p => p.id);

      if (!admins.includes(sender)) {
        return sock.sendMessage(from, {
          text: '🛡️ Admins only!'
        }, { quoted: msg });
      }
    }

    // ===============================
    // EXECUTE COMMAND
    // ===============================
    try {
      await command.execute(sock, msg, args, {
        from,
        sender,
        isGroup,
        isOwner: owner,
        groupSettings, // 🔥 IMPORTANT (used by antidelete)
        config,

        reply: (text) =>
          sock.sendMessage(from, { text }, { quoted: msg })
      });

    } catch (cmdErr) {
      console.log(`❌ Command Error (${commandName}):`, cmdErr.message);
    }

  } catch (err) {
    console.log('❌ Handler Crash:', err.message);
  }
};

module.exports = { handleMessage };
