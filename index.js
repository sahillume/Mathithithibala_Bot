/**
 * WhatsApp MD Bot - FIXED STABLE CORE
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';

const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const config = require('./config');
const handler = require('./handler');

const messageStore = new Map();

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      browser: [config.botName || 'Bot', 'Chrome', '1.0.0'],
      auth: state,
      printQRInTerminal: true, // QR fallback ON
      logger: pino({ level: 'silent' })
    });

    // ===============================
    // 🔐 SMART LOGIN SYSTEM (FIXED)
    // ===============================
    const number = config.ownerNumbers?.[0];

    setTimeout(async () => {
      try {
        // If number exists → try pair code
        if (number) {
          console.log('🔄 Trying Pair Code Login...');

          const code = await sock.requestPairingCode(number);

          console.log(`
🔑 PAIR CODE GENERATED
========================
📱 Number: ${number}
🔐 Code: ${code}
========================
          `);
        } else {
          console.log('📱 No owner number → QR mode active');
        }
      } catch (err) {
        console.log('⚠️ Pair failed → Use QR code instead');
      }
    }, 3000);

    // ===============================
    // CONNECTION HANDLER
    // ===============================
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        console.log(`\n✅ ${config.botName} CONNECTED\n`);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expired - delete session folder');
          process.exit(0);
        }

        console.log('⚠️ Reconnecting...');
        setTimeout(startBot, 4000);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // ===============================
    // MESSAGE HANDLER
    // ===============================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          if (!msg.message) continue;

          const chat = msg.key.remoteJid;
          if (chat === 'status@broadcast') continue;

          if (msg.key?.id) {
            messageStore.set(msg.key.id, msg);
          }

          await handler.handleMessage(sock, msg);

        } catch (err) {
          console.log('Handler Error:', err?.message);
        }
      }
    });

    // ===============================
    // ANTI DELETE (FIXED SAFE)
    // ===============================
    sock.ev.on('messages.update', async (updates) => {
      for (const u of updates) {
        try {
          if (u.update?.message === null) {

            const oldMsg = messageStore.get(u.key.id);
            if (!oldMsg) continue;

            const owner = (config.ownerNumbers?.[0] || '') + '@s.whatsapp.net';

            await sock.sendMessage(owner, {
              text: `🚨 Deleted message detected in ${u.key.remoteJid}`
            });

            await sock.sendMessage(owner, {
              forward: oldMsg
            });
          }
        } catch {}
      }
    });

  } catch (err) {
    console.log('❌ Fatal error:', err.message);
    setTimeout(startBot, 5000);
  }
}

console.log(`🚀 Starting ${config.botName}...`);
startBot();
