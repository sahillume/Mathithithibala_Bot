const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const readline = require('readline');

function question(text) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(text, resolve));
}

async function startPair() {
  console.log("\n🚀 Starting Pair Code System...\n");

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' })
  });

  // ===============================
  // 🔗 CONNECTION
  // ===============================
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log("✅ Connected Successfully!");
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Logged out. Restart pairing.");
        process.exit(0);
      }

      console.log("⚠️ Reconnecting...");
      startPair();
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ===============================
  // 📲 PAIR CODE GENERATION
  // ===============================
  const number = await question("📱 Enter your WhatsApp number (with country code): ");

  try {
    const code = await sock.requestPairingCode(number.trim());

    console.log("\n================================");
    console.log("🔐 YOUR PAIR CODE:");
    console.log(code);
    console.log("================================\n");

    console.log("👉 Open WhatsApp → Linked Devices → Link with code");
  } catch (e) {
    console.log("❌ Failed to generate pair code:", e.message);
  }
}

startPair();
