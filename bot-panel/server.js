const express = require('express');
const path = require('path');
const pino = require('pino');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessions = {}; // store active sessions

// ===============================
// 🚀 GENERATE PAIR CODE
// ===============================
app.post('/pair', async (req, res) => {
  try {
    let { number } = req.body;

    if (!number) {
      return res.json({ error: "Number required" });
    }

    number = number.replace(/\D/g, '');

    const sessionPath = path.join(__dirname, 'sessions', number);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" })
    });

    sock.ev.on('creds.update', saveCreds);

    const code = await sock.requestPairingCode(number);

    sessions[number] = sock;

    res.json({
      success: true,
      code: code
    });

  } catch (err) {
    console.log(err);
    res.json({ error: "Failed to generate pair code" });
  }
});

// ===============================
// 🌐 START SERVER
// ===============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🌐 Panel running on http://localhost:${PORT}`);
});
