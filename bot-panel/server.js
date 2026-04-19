const express = require('express');
const cors = require('cors');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const sessions = {};

// ===============================
// 📲 CREATE PAIR SESSION
// ===============================
app.post('/pair', async (req, res) => {
  const { number } = req.body;

  if (!number) return res.json({ error: 'Number required' });

  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${number}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  try {
    const code = await sock.requestPairingCode(number);

    sessions[number] = sock;

    return res.json({
      success: true,
      code
    });

  } catch (e) {
    return res.json({ error: e.message });
  }
});

// ===============================
// 📦 SESSION STATUS
// ===============================
app.get('/status/:number', (req, res) => {
  const { number } = req.params;

  if (sessions[number]) {
    return res.json({ connected: true });
  }

  res.json({ connected: false });
});

// ===============================
// 🌐 START SERVER
// ===============================
app.listen(3000, () => {
  console.log("🚀 Bot Panel running on http://localhost:3000");
});
