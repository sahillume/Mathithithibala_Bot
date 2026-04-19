/**
 * WhatsApp MD Bot - Main Entry Point
 * BOT: Mathithibala_Bot
 * OWNER: Professor Sahil
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR =
  process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

// ===============================
// 📦 IMPORTS
// ===============================
const pino = require('pino');
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
// 🧹 CLEAN CONSOLE
// ===============================
const originalLog = console.log;
const forbiddenPatterns = ['prekey', 'session', 'ratchet'];

console.log = (...args) => {
  const msg = args.join(' ').toLowerCase();
  if (!forbiddenPatterns.some(p => msg.includes(p))) {
    originalLog(...args);
  }
};

// ===============================
// 🤖 START BOT
// ===============================
async function startBot() {
  try {
    const sessionFolder = './session';

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      browser: [config.botName, 'Chrome', '1.0'],
      auth: state,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      logger: pino({ level: 'silent' })
    });

    // ===============================
    // 🔗 CONNECTION HANDLER
    // ===============================
    sock.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      // 📱 QR
      if (qr) {
        console.clear();
        console.log(`\n📱 SCAN QR TO CONNECT\n`);
        qrcode.generate(qr, { small: true });

        console.log(`
🔥 STEPS:
1. Open WhatsApp
2. Linked Devices
3. Scan QR

👑 Owner: ${config.ownerName}
🤖 Bot: ${config.botName}
`);
      }

      // ✅ CONNECTED
      if (connection === 'open') {
        console.clear();
        console.log(`
✅ ${config.botName} ONLINE
👑 Owner: ${config.ownerName}
⚡ Sahil Pro Mode Active
`);

        await sock.updateProfileStatus(
          `🤖 ${config.botName} | 👑 ${config.ownerName}`
        );
      }

      // ❌ DISCONNECTED (IMPROVED RECONNECT)
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Logged out. Delete session and re-scan QR.');
          process.exit(0);
        } else {
          console.log('⚠️ Disconnected. Reconnecting in 5s...');
          setTimeout(startBot, 5000);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // ===============================
    // 📩 MESSAGE HANDLER (SAFE VERSION)
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          if (!msg.message) continue;
          if (msg.key.remoteJid === 'status@broadcast') continue;

          await handler.handleMessage(sock, msg);

        } catch (err) {
          console.log('⚠️ Handler error:', err?.message || err);
        }
      }
    });

  } catch (err) {
    console.log('❌ Startup error:', err?.message || err);
    setTimeout(startBot, 5000);
  }
}

// ===============================
// 🚀 START BOT
// ===============================
console.log(`
🚀 Starting ${config.botName}
👑 Owner: ${config.ownerName}
`);

startBot();
