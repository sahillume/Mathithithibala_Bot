/**
 * Message Handler - Processes incoming messages and executes commands
 */

const config = require('./config');
const database = require('./database');
const { loadCommands } = require('./utils/commandLoader');
const { addMessage } = require('./utils/groupstats');
const { jidDecode, jidEncode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ===============================
// ⏳ COOLDOWN SYSTEM
// ===============================
const cooldowns = new Map();

// Group metadata cache
const groupMetadataCache = new Map();
const CACHE_TTL = 60000;

// Load commands
const commands = loadCommands();

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
    // EXTRACT MESSAGE TEXT
    // ===============================
    let body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    body = (body || '').trim();

    // ===============================
    // 🤖 AI AUTO REPLY
    // ===============================
    if (!body.startsWith(config.prefix) && !msg.key.fromMe) {
      if (config.aiMode) {
        try {
          const res = await axios.get(
            `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(body)}&botname=Mathithibala&ownername=Sahil`
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
    if (!isOwner(sender)) {
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
    // CHECK PREFIX
    // ===============================
    if (!body.startsWith(config.prefix)) return;

    // ===============================
    // ⏳ COOLDOWN SYSTEM
    // ===============================
    const now = Date.now();
    const last = cooldowns.get(sender) || 0;

    if (now - last < 3000) {
      return sock.sendMessage(from, {
        text: '⏳ Please wait before using another command.'
      }, { quoted: msg });
    }

    cooldowns.set(sender, now);

    // ===============================
    // PARSE COMMAND
    // ===============================
    const args = body.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    // ===============================
    // OWNER CHECK
    // ===============================
    if (command.ownerOnly && !isOwner(sender)) {
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
      isOwner: isOwner(sender),
      reply: (text) => sock.sendMessage(from, { text }, { quoted: msg })
    });

  } catch (err) {
    console.error('Handler Error:', err);
  }
};

// ===============================
// OWNER CHECK
// ===============================
const isOwner = (sender) => {
  if (!sender) return false;
  const number = sender.split('@')[0];
  return config.ownerNumber.includes(number);
};

module.exports = {
  handleMessage
};
