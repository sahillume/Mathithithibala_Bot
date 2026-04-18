const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config.js');

// ===============================
// 📦 LOAD CONFIG (SAFE)
// ===============================
function load() {
    try {
        delete require.cache[require.resolve('../config.js')];
        const config = require('../config.js');

        return {
            enabled: Boolean(config.autoReact),
            mode: ['bot', 'user', 'both'].includes(config.autoReactMode)
                ? config.autoReactMode
                : 'bot'
        };

    } catch (err) {
        return {
            enabled: false,
            mode: 'bot'
        };
    }
}

// ===============================
// 💾 SAFE SAVE (IMPROVED)
// ===============================
function save(data) {
    try {
        let configContent = fs.readFileSync(CONFIG_PATH, 'utf8');

        const enabled = data.enabled ? 'true' : 'false';
        const mode = ['bot', 'user', 'both'].includes(data.mode)
            ? data.mode
            : 'bot';

        // Safer replacements with fallback safety
        if (configContent.includes('autoReact:')) {
            configContent = configContent.replace(
                /autoReact:\s*(true|false)/,
                `autoReact: ${enabled}`
            );
        }

        if (configContent.includes('autoReactMode:')) {
            configContent = configContent.replace(
                /autoReactMode:\s*['"]\w+['"]/,
                `autoReactMode: '${mode}'`
            );
        } else {
            // Insert safely near autoReact
            configContent = configContent.replace(
                /(autoReact:\s*(?:true|false),?)/,
                `$1\n  autoReactMode: '${mode}',`
            );
        }

        fs.writeFileSync(CONFIG_PATH, configContent, 'utf8');

        // Clear cache
        delete require.cache[require.resolve('../config.js')];

    } catch (err) {
        console.error('[autoReact] Save failed:', err.message);
    }
}

module.exports = { load, save };
