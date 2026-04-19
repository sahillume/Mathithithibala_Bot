/**
 * WhatsApp MD Bot - MAIN CORE (PRO MAX)
 * BOT: Mathithibala_Bot
 * OWNER: Professor Sahil
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

// ===============================
// 📦 IMPORTS
// ===============================
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');

// ===============================
// 🧠 MEMORY SYSTEM (ANTI-DELETE / LOG)
// ===============================
const messageStore = new Map();

// ===============================
// 🧹 CLEAN LOGS
// ===============================
const originalLog = console.log;
console.log = (...args) => {
  const msg = args.join(' ').toLowerCase();
  if (!msg.includes('prekey') && !msg.includes('session')) {
    originalLog(...args);
  }
};

// ===============================
// 🤖 START BOT
// ===============================
async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      browser: [config.botName, 'Chrome', '5.0'],
      auth: state,
      markOnlineOnConnect: true,
      logger: pino({ level: 'silent' }),
      syncFullHistory: false
    });

    // ===============================
    // 🔗 CONNECTION EVENTS
    // ===============================
    sock.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        console.clear();
        console.log(`📱 SCAN QR CODE:\n`);
        qrcode.generate(qr, { small: true });

        console.log(`
👑 Owner: ${config.ownerName}
🤖 Bot: ${config.botName}
`);
      }

      if (connection === 'open') {
        console.clear();
        console.log(`
✅ ${config.botName} CONNECTED
👑 Owner: ${config.ownerName}
⚡ Pro System Active
`);

        await sock.updateProfileStatus(
          `🤖 ${config.botName} | 👑 ${config.ownerName}`
        );
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expired. Delete session & scan again.');
          process.exit(0);
        }

        console.log('⚠️ Reconnecting in 5 seconds...');
        setTimeout(startBot, 5000);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // ===============================
    // 📩 MESSAGE LISTENER (PRO)
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          if (!msg.message) continue;

          const chat = msg.key.remoteJid;

          // ❌ ignore status (we handle separately)
          if (chat === 'status@broadcast') continue;

          // 🧠 SAVE MESSAGE (ANTI DELETE SYSTEM)
          messageStore.set(msg.key.id, msg);

          // 🚀 MAIN HANDLER
          await handler.handleMessage(sock, msg);

        } catch (err) {
          console.log('Handler Error:', err?.message);
        }
      }
    });

    // ===============================
    // 🗑️ DELETE DETECTION (ANTI DELETE PRO)
    // ===============================
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        if (update.update?.message === null) {
          const deletedMsg = messageStore.get(update.key.id);

          if (!deletedMsg) return;

          const owner = config.ownerNumbers[0] + '@s.whatsapp.net';

          await sock.sendMessage(owner, {
            text: `🚨 *DELETED MESSAGE DETECTED*\n\n👤 ${update.key.remoteJid}`
          });

          await sock.sendMessage(owner, {
            forward: deletedMsg
          });
        }
      }
    });

    // ===============================
    // 👁️ VIEW ONCE AUTO SAVE (VV PRO CORE)
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          const m = msg.message;

          if (!m) continue;

          const isViewOnce =
            m?.viewOnceMessageV2 ||
            m?.viewOnceMessageV2Extension ||
            m?.viewOnceMessage;

          if (!isViewOnce) continue;

          const owner = config.ownerNumbers[0] + '@s.whatsapp.net';

          await sock.sendMessage(owner, {
            text: `👁️ *VIEW-ONCE DETECTED*\nFrom: ${msg.key.remoteJid}`
          });

          await sock.sendMessage(owner, {
            forward: msg
          });

        } catch (e) {}
      }
    });

    // ===============================
    // 🧠 AUTO COMMAND LOADER CHECK
    // ===============================
    const commandsPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsPath)) {
      console.log("❌ Commands folder missing!");
    } else {
      console.log("📦 Commands loaded successfully");
    }

  } catch (err) {
    console.log('❌ Startup error:', err?.message);
    setTimeout(startBot, 5000);
  }
}

// ===============================
// 🚀 INIT
// ===============================
console.log(`
🚀 Starting ${config.botName}
👑 Owner: ${config.ownerName}
🔥 Loading Pro System...
`);

startBot();
