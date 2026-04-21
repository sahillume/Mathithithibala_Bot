module.exports = {

  // 👑 OWNER CONFIG (FIXED SAFE)
  ownerNumbers: process.env.OWNER_NUMBER
    ? process.env.OWNER_NUMBER.split(',').map(n => n.replace(/\D/g, ''))
    : [], // ❗ EMPTY = QR MODE (IMPORTANT FIX)

  ownerName: process.env.OWNER_NAME || 'Professor Sahil',

  // 🤖 BOT CONFIG
  botName: process.env.BOT_NAME || 'Mathithibala Bot',
  prefix: process.env.PREFIX || '.',

  // 🔐 SESSION
  sessionName: 'session',
  sessionID: process.env.SESSION_ID || '',

  // 🔥 PAIRING SYSTEM
  pairing: {
    enabled: true,
    autoAskNumber: true,
    timeout: 60000,
    fallbackToQR: true
  },

  // 🔗 CHANNEL
  newsletterJid: process.env.NEWSLETTER_JID || '120363406672648713@newsletter',

  channel: {
    url: 'https://whatsapp.com/channel/0029VbCIUrC4tRrmjdI9QM1x',
    jid: '120363406672648713@newsletter'
  },

  newsletterName: 'Mathithibala Channel',
  updateZipUrl: process.env.UPDATE_ZIP_URL || '',

  // 🎨 STICKERS
  packname: 'Mathithibala Bot',
  author: 'Professor Sahil',

  // ⚙️ BOT BEHAVIOR
  selfMode: false,
  autoRead: true,
  autoTyping: true,
  autoBio: false,
  autoSticker: false,
  autoReact: true,
  autoReactMode: 'bot',
  autoDownload: false,

  // 🧠 AI
  ai: {
    enabled: true,
    smartFallback: true,
    respectPrivacy: true,
    personality: "professional",
    creatorName: "Professor Sahil",
    antiLoop: true
  },

  // 🛡️ GROUP SETTINGS
  defaultGroupSettings: {
    antilink: false,
    antilinkAction: 'delete',
    antitag: false,
    antitagAction: 'delete',
    antidelete: true,
    welcome: false,
    goodbye: false
  },

  // 🔑 API
  apiKeys: {
    openai: process.env.OPENAI_KEY || ''
  },

  // 💬 MESSAGES
  messages: {
    wait: '⏳ Processing...',
    success: '✅ Done!',
    error: '❌ Error!',
    ownerOnly: '👑 Owner only!'
  },

  timezone: 'Africa/Johannesburg',

  maxWarnings: 3,

  social: {
    github: 'https://github.com/sahillume/Mathithithibala_Bot',
    youtube: 'https://youtube.com/@professorsahil-m7q'
  },

  system: {
    version: 'PRO-MAX-STABLE',
    logLevel: 'silent',
    antiCrash: true
  }
};
