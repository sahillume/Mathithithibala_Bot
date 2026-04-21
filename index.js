/**
 * WhatsApp MD Bot - MAIN CORE (AUTO PAIR FIX)
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

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

const config = require('./config');
const handler = require('./handler');

// ===============================
// 🧠 MEMORY
// ===============================
const messageStore = new Map();

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
    // 🔐 AUTO PAIR CODE SYSTEM
    // ===============================
    if (!state.creds.registered) {
      const number = config.ownerNumbers[0];

      if (!number) {
        console.log('❌ No owner number in config.js');
      } else {
        setTimeout(async () => {
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
        }, 3000);
      }
    }

    // ===============================
    // 🔗 CONNECTION EVENTS
    // ===============================
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        console.log(`✅ ${config.botName} CONNECTED`);

        try {
          await sock.updateProfileStatus(
            `🤖 ${config.botName} | 👑 ${config.ownerName}`
          );
        } catch {}

      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expired. Delete session folder.');
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

          // Save message
          if (msg.key?.id) {
            messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));
          }

          await handler.handleMessage(sock, msg);

        } catch (err) {
          console.log('Handler Error:', err?.message);
        }
      }
    });

    // ===============================
    // 🗑️ ANTI DELETE (WORKING)
    // ===============================
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        try {
          if (update.update?.message === null) {

            const deletedMsg = messageStore.get(update.key.id);
            if (!deletedMsg) continue;

            const ownerJid = config.ownerNumbers[0] + '@s.whatsapp.net';

            await sock.sendMessage(ownerJid, {
              text: `🚨 DELETED MESSAGE\n📍 ${update.key.remoteJid}`
            });

            await sock.sendMessage(ownerJid, {
              forward: deletedMsg
            });
          }
        } catch {}
      }
    });

  } catch (err) {
    console.log('❌ Startup error:', err?.message);
    setTimeout(startBot, 5000);
  }
}

// ===============================
console.log(`🚀 Starting ${config.botName}`);
startBot();
