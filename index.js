/**
 * WhatsApp MD Bot - MAIN CORE (PRO MAX FINAL)
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
const readline = require('readline');

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
// 🔐 PAIR INPUT SYSTEM
// ===============================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askNumber = () => {
  return new Promise((resolve) => {
    rl.question('📱 Enter WhatsApp number (e.g 2783xxxxxxx): ', resolve);
  });
};

// ===============================
// 🧠 MEMORY (ANTI DELETE)
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
    const usePairingCode = true; // 🔥 enable pairing
    let phoneNumber;

    if (usePairingCode) {
      phoneNumber = await askNumber();
    }

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
    // 🔐 PAIR CODE SYSTEM
    // ===============================
    if (usePairingCode && !sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber);

          console.log(`
🔑 =========================
   PAIR CODE GENERATED
=========================

📱 Number: ${phoneNumber}
🔐 Code: ${code}

👉 WhatsApp > Linked Devices
👉 Link with code

=========================
`);
        } catch (err) {
          console.log('❌ Pairing error:', err.message);
        }
      }, 3000);
    }

    // ===============================
    // 🔗 CONNECTION EVENTS
    // ===============================
    sock.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      // 📱 QR fallback
      if (qr && !usePairingCode) {
        console.clear();
        console.log(`📱 SCAN QR CODE:\n`);
        qrcode.generate(qr, { small: true });
      }

      // ✅ CONNECTED
      if (connection === 'open') {
        console.clear();
        console.log(`
✅ ${config.botName} CONNECTED
👑 Owner: ${config.ownerName}
⚡ Pro System Active
`);

        try {
          await sock.updateProfileStatus(
            `🤖 ${config.botName} | 👑 ${config.ownerName}`
          );
        } catch (e) {}

        // 📢 Newsletter
        try {
          if (config.newsletterJid) {
            await sock.sendMessage(config.newsletterJid, {
              text:
`🚀 *${config.botName} ONLINE*

👑 Owner: ${config.ownerName}
⚡ Status: Active
🕒 ${new Date().toLocaleString()}

🔥 Sahil Pro System`
            });
          }
        } catch (e) {
          console.log('Newsletter error:', e.message);
        }
      }

      // ❌ DISCONNECTED
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expired. Delete session & reconnect.');
          process.exit(0);
        }

        console.log('⚠️ Reconnecting in 5 seconds...');
        setTimeout(startBot, 5000);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // ===============================
    // 📩 MESSAGE HANDLER
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          if (!msg.message) continue;

          const chat = msg.key.remoteJid;
          if (chat === 'status@broadcast') continue;

          // 🧠 STORE MESSAGE (SAFE COPY)
          if (msg.key?.id) {
            messageStore.set(
              msg.key.id,
              JSON.parse(JSON.stringify(msg))
            );
          }

          await handler.handleMessage(sock, msg);

        } catch (err) {
          console.log('Handler Error:', err?.message);
        }
      }
    });

    // ===============================
    // 🗑️ ANTI DELETE (FIXED)
    // ===============================
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        try {
          if (update.update?.message === null) {

            const deletedMsg = messageStore.get(update.key.id);
            if (!deletedMsg) continue;

            const ownerJid = config.ownerNumbers[0] + '@s.whatsapp.net';

            await sock.sendMessage(ownerJid, {
              text:
`🚨 *DELETED MESSAGE DETECTED*
📍 Chat: ${update.key.remoteJid}`
            });

            await sock.sendMessage(ownerJid, {
              forward: deletedMsg
            });
          }
        } catch (e) {}
      }
    });

    // ===============================
    // 👁️ VIEW ONCE DETECTION
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

          const ownerJid = config.ownerNumbers[0] + '@s.whatsapp.net';

          await sock.sendMessage(ownerJid, {
            text:
`👁️ *VIEW-ONCE DETECTED*
📍 From: ${msg.key.remoteJid}`
          });

          await sock.sendMessage(ownerJid, {
            forward: msg
          });

        } catch (e) {}
      }
    });

    // ===============================
    // 📦 COMMAND CHECK
    // ===============================
    const commandsPath = path.join(__dirname, 'commands');

    if (!fs.existsSync(commandsPath)) {
      console.log('❌ Commands folder missing!');
    } else {
      console.log('📦 Commands loaded successfully');
    }

  } catch (err) {
    console.log('❌ Startup error:', err?.message);
    setTimeout(startBot, 5000);
  }
}

// ===============================
// 🚀 START
// ===============================
console.log(`
🚀 Starting ${config.botName}
👑 Owner: ${config.ownerName}
🔥 Loading Pro System...
`);

startBot();
