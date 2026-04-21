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

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      browser: [config.botName || 'Bot', 'Chrome', '1.0.0'],
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' })
    });

    const number = config.ownerNumbers?.[0];

    // =========================
    // 🔗 CONNECTION HANDLER (FIXED)
    // =========================
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // ✅ SHOW QR
      if (qr) {
        console.log('\n📱 SCAN THIS QR CODE:\n');
        qrcode.generate(qr, { small: true });

        // ✅ GENERATE PAIR CODE ONLY HERE (NO LOOP)
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
          } catch {
            console.log('⚠️ Pair code failed, use QR');
          }
        }
      }

      // ✅ CONNECTED
      if (connection === 'open') {
        console.log(`\n✅ ${config.botName} CONNECTED\n`);
      }

      // ✅ RECONNECT FIX
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Session expired → DELETE session folder manually');
          return; // ❗ DON'T crash loop
        }

        console.log('⚠️ Reconnecting...');
        setTimeout(startBot, 4000);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // =========================
    // 📩 MESSAGE HANDLER
    // =========================
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        try {
          if (!msg.message) continue;

          const chat = msg.key.remoteJid;
          if (!chat || chat === 'status@broadcast') continue;

          messageStore.set(msg.key.id, msg);

          await handler.handleMessage(sock, msg);

          // 🔥 MEMORY CLEANUP
          if (messageStore.size > 500) {
            const firstKey = messageStore.keys().next().value;
            messageStore.delete(firstKey);
          }

        } catch (err) {
          console.log('Handler Error:', err?.message);
        }
      }
    });

    // =========================
    // 🗑️ ANTI DELETE
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
              text: `🚨 Deleted message in ${u.key.remoteJid}`
            });

            await sock.sendMessage(owner, {
              forward: oldMsg
            });
          }
        } catch {}
      }
    });

  } catch (err) {
    console.log('❌ Fatal error:', err?.message);
    setTimeout(startBot, 5000);
  }
}

console.log(`🚀 Starting ${config.botName}...`);
startBot();
