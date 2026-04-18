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
// 🧹 CLEAN CONSOLE (PRO LOOK)
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
  const sessionFolder = './session'; // 🔥 fixed (no undefined errors)

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
  // 🔗 CONNECTION SYSTEM
  // ===============================
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    // 📱 QR CODE
    if (qr) {
      console.clear();
      console.log(`
╔══════════════════════════════╗
   📱 SCAN QR TO CONNECT
╚══════════════════════════════╝
`);
      qrcode.generate(qr, { small: true });

      console.log(`
🔥 STEPS:
1. Open WhatsApp
2. Tap ⋮ (3 dots)
3. Linked Devices
4. Link a Device
5. Scan QR

👑 Owner: ${config.ownerName}
🤖 Bot: ${config.botName}
`);
    }

    // ✅ CONNECTED
    if (connection === 'open') {
      console.clear();
      console.log(`
╔══════════════════════════════╗
   ✅ BOT CONNECTED SUCCESSFULLY
╚══════════════════════════════╝

🤖 ${config.botName} is ONLINE
👑 Owner: ${config.ownerName}
⚡ Mode: Sahil Pro Activated
`);

      await sock.updateProfileStatus(
        `🤖 ${config.botName} | 👑 ${config.ownerName} | ⚡ Sahil Pro`
      );
    }

    // ❌ DISCONNECTED
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log('\n❌ Session expired. Delete session folder and scan again.');
      } else {
        console.log('\n⚠️ Connection lost. Reconnecting in 3 seconds...');
        setTimeout(startBot, 3000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ===============================
  // 📩 MESSAGE SYSTEM
  // ===============================
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;

      // ❌ Ignore status messages
      if (msg.key.remoteJid === 'status@broadcast') continue;

      try {
        await handler.handleMessage(sock, msg);
      } catch (err) {
        console.error('Handler Error:', err);
      }
    }
  });

  return sock;
}

// ===============================
// 🚀 START BOT
// ===============================
console.log(`
🚀 Starting ${config.botName}...
👑 Owner: ${config.ownerName}
`);

startBot().catch(err => console.error('Startup Error:', err));
