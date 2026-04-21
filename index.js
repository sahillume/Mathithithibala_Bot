process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';

const pino = require('pino');
const qrcode = require('qrcode-terminal');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const config = require('./config');
const handler = require('./handler');

const messageStore = new Map();

// 🔥 BOT TAG
const BOT_NAME = config.botName || 'Mathithibala_Bot';

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      browser: [BOT_NAME, 'Chrome', '1.0.0'],
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' })
    });

    const number = config.ownerNumbers?.[0];

    // =========================
    // 🔗 CONNECTION HANDLER (PRO FIXED)
    // =========================
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // 📱 QR DISPLAY
      if (qr) {
        console.log('\n📱 SCAN THIS QR CODE:\n');
        qrcode.generate(qr, { small: true });

        // 🔑 PAIR CODE (SAFE FIX - NO LOOP)
        if (number) {
          try {
            console.log('🔄 Generating Pair Code...');
            const code = await sock.requestPairingCode(number);

            console.log(`
🔑 PAIR CODE
=====================
📱 ${number}
🔐 ${code}
=====================
`);
          } catch (e) {
            console.log('⚠️ Pairing failed, use QR instead');
          }
        }
      }

      // ✅ CONNECTED
      if (connection === 'open') {
        console.log(`\n✅ ${BOT_NAME} CONNECTED SUCCESSFULLY\n`);
      }

      // 🔁 RECONNECT SYSTEM (STABLE)
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log('❌ Session expired. Delete /session and restart.');
          return;
        }

        console.log('⚠️ Connection lost. Reconnecting...');
        setTimeout(startBot, 5000);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // =========================
    // 📩 MESSAGE HANDLER (STABLE)
    // =========================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          if (!msg?.message) continue;

          const chat = msg.key.remoteJid;
          if (!chat || chat === 'status@broadcast') continue;

          messageStore.set(msg.key.id, msg);

          await handler.handleMessage(sock, msg);

          // 🧹 MEMORY CLEANUP (PREVENT LEAKS)
          if (messageStore.size > 500) {
            const firstKey = messageStore.keys().next().value;
            messageStore.delete(firstKey);
          }

        } catch (err) {
          console.log(`[${BOT_NAME}] Handler Error:`, err?.message);
        }
      }
    });

    // =========================
    // 🗑️ ANTI DELETE (SAFE VERSION)
    // =========================
    sock.ev.on('messages.update', async (updates) => {
      for (const u of updates) {
        try {
          if (u.update?.message === null) {

            const oldMsg = messageStore.get(u.key.id);
            if (!oldMsg) continue;

            const ownerNumber = config.ownerNumbers?.[0];
            if (!ownerNumber) return;

            const owner = ownerNumber + '@s.whatsapp.net';

            await sock.sendMessage(owner, {
              text: `🚨 Deleted message detected in ${u.key.remoteJid}`
            });

            await sock.sendMessage(owner, {
              forward: oldMsg
            });
          }
        } catch (e) {
          console.log(`[${BOT_NAME}] Anti-delete error`);
        }
      }
    });

  } catch (err) {
    console.log(`❌ Fatal error:`, err?.message);

    // 🔁 AUTO RECOVERY
    setTimeout(startBot, 7000);
  }
}

console.log(`🚀 Starting ${BOT_NAME}...`);
startBot();
