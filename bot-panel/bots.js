/**
 * BOT INSTANCE - Mathithibala Bot Engine
 * Runs per session (panel system)
 */

const pino = require('pino');
const fs = require('fs');
const path = require('path');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const { loadCommands } = require('../../utils/commandLoader');

async function startBot(sessionId) {
  const sessionPath = path.join(__dirname, `../../sessions/${sessionId}`);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const commands = loadCommands();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Mathithibala Bot', 'Chrome', '1.0']
  });

  // ===============================
  // 🔐 SAVE SESSION
  // ===============================
  sock.ev.on('creds.update', saveCreds);

  // ===============================
  // 🔗 CONNECTION HANDLER
  // ===============================
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`✅ Bot connected: ${sessionId}`);
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log(`❌ Session logged out: ${sessionId}`);
        return;
      }

      console.log(`⚠️ Reconnecting bot: ${sessionId}`);
      startBot(sessionId);
    }
  });

  // ===============================
  // 📩 MESSAGE HANDLER
  // ===============================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      try {
        if (!msg.message) continue;

        const from = msg.key.remoteJid;

        let body =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          '';

        if (!body.startsWith('.')) return;

        const args = body.slice(1).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();

        const command = commands.get(cmdName);
        if (!command) return;

        await command.execute(sock, msg, args, {
          from,
          sender: msg.key.participant || msg.key.remoteJid,
          reply: (text) =>
            sock.sendMessage(from, { text }, { quoted: msg })
        });

      } catch (err) {
        console.log('Bot error:', err.message);
      }
    }
  });

  return sock;
}

module.exports = { startBot };
