/**
 * WhatsApp MD Bot - MAIN CORE (PRO MAX FINAL STABLE)
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
// 🧠 MEMORY (ANTI DELETE)
// ===============================
const messageStore = new Map();

// ===============================
// 🔐 ASK NUMBER (PAIR CODE)
// ===============================
const askNumber = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('📱 Enter WhatsApp number (e.g 27835515085): ', (num) => {
      rl.close();
      resolve(num);
    });
  });
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
      browser: [config.botName, 'Chrome', '5.0'],
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: true
    });

    // ===============================
    // 🔐 PAIR CODE SYSTEM
    // ===============================
    if (!state.creds.registered) {
      const number = await askNumber();

      try {
        const code = await sock.requestPairingCode(number);

        console.log(`
🔑 =========================
   PAIR CODE GENERATED
=========================

📱 Number: ${number}
🔐 Code: ${code}

👉 WhatsApp > Linked Devices
👉 Link with code

=========================
`);
      } catch (err) {
        console.log('❌ Pairing error:', err.message);
      }
    }

    // ===============================
    // 🔗 CONNECTION EVENTS
    // ===============================
    sock.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr && state.creds.registered) {
        console.log('📱 Scan QR if needed:');
        qrcode.generate(qr, { small: true });
      }

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
        } catch {}

        // 📢 Newsletter
        try {
          if (config.newsletterJid) {
            await sock.sendMessage(config.newsletterJid, {
              text: `🚀 *${config.botName} ONLINE*

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

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expired. Delete session & reconnect.');
          process.exit(0);
        }

        console.log('⚠️ Reconnecting...');
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

          // SAVE MESSAGE
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
    // 🗑️ ANTI DELETE (CONTROLLED)
    // ===============================
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        try {
          if (!config.defaultGroupSettings.antidelete) return;

          if (update.update?.message === null) {
            const deletedMsg = messageStore.get(update.key.id);
            if (!deletedMsg) continue;

            const ownerJid = config.ownerNumbers[0] + '@s.whatsapp.net';

            await sock.sendMessage(ownerJid, {
              text: `🚨 *DELETED MESSAGE DETECTED*
📍 Chat: ${update.key.remoteJid}`
            });

            await sock.sendMessage(ownerJid, {
              forward: deletedMsg
            });
          }
        } catch {}
      }
    });

    // ===============================
    // 👁️ VIEW ONCE DETECTION
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          if (!config.defaultGroupSettings.antiviewonce) return;

          const m = msg.message;
          if (!m) continue;

          const isViewOnce =
            m?.viewOnceMessageV2 ||
            m?.viewOnceMessageV2Extension ||
            m?.viewOnceMessage;

          if (!isViewOnce) continue;

          const ownerJid = config.ownerNumbers[0] + '@s.whatsapp.net';

          await sock.sendMessage(ownerJid, {
            text: `👁️ *VIEW-ONCE DETECTED*
📍 From: ${msg.key.remoteJid}`
          });

          await sock.sendMessage(ownerJid, {
            forward: msg
          });

        } catch {}
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
