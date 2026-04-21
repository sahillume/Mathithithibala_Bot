const config = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const { getGroupSettings } = require('./database');
const axios = require('axios');

const cooldowns = new Map();
const commands = loadCommands();

// 🔥 BOT TAG
const BOT_NAME = config.botName || 'Mathithibala_Bot';

// ===============================
// PREFIX SYSTEM
// ===============================
const getPrefixes = () => [
  config.prefix,
  '.', '!', '#', '/', '?'
];

// ===============================
// OWNER CHECK (FIXED SAFE VERSION)
// ===============================
const isOwner = (sender = '') => {
  const number = sender.split('@')[0];
  return (config.ownerNumbers || []).includes(number);
};

// ===============================
// MAIN HANDLER (PRO MAX)
// ===============================
const handleMessage = async (sock, msg) => {
  try {
    if (!msg?.message) return;

    const from = msg.key.remoteJid;
    if (!from) return;

    // ===============================
    // 👤 SENDER FIX (GROUP SAFE)
    // ===============================
    const sender =
      msg.key.fromMe
        ? sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
        : msg.key.participant ||
          msg.participant ||
          msg.key.remoteJid;

    if (!sender) return;

    const isGroup = from.endsWith('@g.us');

    // ===============================
    // GROUP SETTINGS
    // ===============================
    const groupSettings = isGroup
      ? getGroupSettings(from)
      : config.defaultGroupSettings;

    // ===============================
    // MESSAGE BODY EXTRACTION (IMPROVED)
    // ===============================
    let body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      '';

    body = body.toString().trim();
    if (!body) return;

    const prefixes = getPrefixes();
    const usedPrefix = prefixes.find(p => body.startsWith(p));

    const owner = isOwner(sender);

    // ===============================
    // 🤖 AI AUTO REPLY (CONTROLLED)
    // ===============================
    if (!usedPrefix && !msg.key.fromMe && config.ai?.enabled) {
      try {
        const res = await axios.get(
          'https://api.affiliateplus.xyz/api/chatbot',
          {
            params: {
              message: body,
              botname: BOT_NAME,
              ownername: config.ownerName
            },
            timeout: 8000
          }
        );

        const reply = res?.data?.message;

        if (reply) {
          return sock.sendMessage(from, {
            text: `🤖 ${reply}`
          }, { quoted: msg });
        }

      } catch (e) {
        // silent fail (prevents spam crashes)
      }
    }

    if (!usedPrefix) return;

    // ===============================
    // COMMAND PARSING (SAFE)
    // ===============================
    const args = body.slice(usedPrefix.length).trim().split(/\s+/);
    const commandName = (args.shift() || '').toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    // ===============================
    // COOLDOWN SYSTEM (IMPROVED)
    // ===============================
    const key = `${sender}_${commandName}`;
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
    // OWNER CHECK
    // ===============================
    if (command.ownerOnly && !owner) {
      return sock.sendMessage(from, {
        text: '❌ Owner only command.'
      }, { quoted: msg });
    }

    // ===============================
    // ADMIN CHECK (FIXED SAFE)
    // ===============================
    if (command.adminOnly && isGroup) {
      try {
        const metadata = await sock.groupMetadata(from);

        const admins = metadata.participants
          .filter(p => p.admin)
          .map(p => p.id);

        if (!admins.includes(sender)) {
          return sock.sendMessage(from, {
            text: '🛡️ Admins only!'
          }, { quoted: msg });
        }

      } catch (e) {
        console.log(`[${BOT_NAME}] Admin check failed`);
      }
    }

    // ===============================
    // EXECUTE COMMAND (CRASH PROTECTED)
    // ===============================
    try {
      await command.execute(sock, msg, args, {
        from,
        sender,
        isGroup,
        isOwner: owner,
        groupSettings,
        config,

        reply: (text) =>
          sock.sendMessage(from, { text }, { quoted: msg })
      });

    } catch (cmdErr) {
      console.log(`❌ [${BOT_NAME}] Command Error:`, cmdErr.message);
    }

  } catch (err) {
    console.log(`❌ [${BOT_NAME}] Handler Crash:`, err.message);
  }
};

module.exports = { handleMessage };
