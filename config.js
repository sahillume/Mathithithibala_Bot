module.exports = {

  // 👑 OWNER CONFIG
  ownerNumbers: process.env.OWNER_NUMBER
    ? process.env.OWNER_NUMBER.split(',')
    : ['27835515085'],

  ownerName: process.env.OWNER_NAME || 'Professor Sahil',

  // 🤖 BOT CONFIG
  botName: process.env.BOT_NAME || 'Mathithibala Bot',
  prefix: process.env.PREFIX || '.',

  // 🔐 SESSION / AUTH SYSTEM
  sessionName: 'session',
  sessionID: process.env.SESSION_ID || '',

  // 🔥 PAIRING SYSTEM
  pairing: {
    enabled: true,
    autoAskNumber: true,
    timeout: 60000
  },

  // 🔗 NEWSLETTER + CHANNEL
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

  // 🧠 AI SYSTEM
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

    antiall: false,
    antiviewonce: false,
    antibot: false,
    anticall: false,

    antigroupmention: false,
    antigroupmentionAction: 'delete',

    antiSpam: false,
    antidelete: true,

    nsfw: false,
    detect: false,
    chatbot: false,
    autosticker: false,

    welcome: false,
    goodbye: false,

    welcomeMessage: '👋 Welcome @user to @group!',
    goodbyeMessage: '👋 Goodbye @user!'
  },

  // 🔑 API KEYS
  apiKeys: {
    openai: process.env.OPENAI_KEY || '',
    deepai: '',
    remove_bg: ''
  },

  // 💬 SYSTEM MESSAGES
  messages: {
    wait: '⏳ Processing...',
    success: '✅ Done!',
    error: '❌ Something went wrong!',

    ownerOnly: '👑 Only owner can use this.',
    adminOnly: '🛡️ Admins only!',
    groupOnly: '👥 Groups only!',
    privateOnly: '💬 Private chat only!',
    botAdminNeeded: '🤖 I need admin rights!',
    invalidCommand: '❓ Unknown command. Try .menu'
  },

  // 🌍 TIMEZONE
  timezone: 'Africa/Johannesburg',

  // ⚠️ LIMITS
  maxWarnings: 3,

  // 🌐 SOCIAL
  social: {
    github: 'https://github.com/sahillume/Mathithithibala_Bot',
    instagram: '',
    youtube: 'https://youtube.com/@professorsahil-m7q?si=KzV352H1SYHZHWKt'
  },

  // 🧠 SYSTEM FLAGS
  system: {
    version: 'PRO-MAX-STABLE',
    logLevel: 'silent',
    antiCrash: true
  }
};
