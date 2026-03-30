/**
 * WhatsApp MD Bot - Main Entry Point
 * BOT: Mathithibala AI
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
  const sessionFolder = `./${config.sessionName}`;

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
      console.log('\n📱 Scan this QR to link WhatsApp:\n');
      qrcode.generate(qr, { small: true });

      console.log(`
🔥 HOW TO CONNECT:
1. Open WhatsApp
2. Tap ⋮ (3 dots)
3. Linked Devices
4. Link a Device
5. Scan this QR

👑 Controlled by ${config.ownerName}
`);
    }

    // ✅ CONNECTED
    if (connection === 'open') {
      console.log('\n✅ BOT CONNECTED SUCCESSFULLY!');
      console.log(`🤖 ${config.botName} is now ONLINE`);
      console.log(`👑 Owner: ${config.ownerName}\n`);

      await sock.updateProfileStatus(
        `🤖 ${config.botName} | Powered by ${config.ownerName} ⚡`
      );
    }

    // ❌ DISCONNECTED
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Logged out. Please scan QR again.');
      } else {
        console.log('⚠️ Connection lost. Reconnecting...');
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

      handler.handleMessage(sock, msg).catch(console.error);
    }
  });

  return sock;
}

// ===============================
// 🚀 START BOT
// ===============================
console.log(`🚀 Starting ${config.botName}...`);
startBot().catch(err => console.error('Startup Error:', err));
