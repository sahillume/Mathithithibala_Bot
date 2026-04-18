/**
 * 🔗 JID Helper Utilities - Mathithibala_Bot
 * Optimized by Professor Sahil
 * Safe LID + PN compatibility layer
 */

const { jidDecode, jidEncode } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// ===============================
// 📦 LID CACHE
// ===============================
const lidMappingCache = new Map();

/**
 * Get LID mapping safely
 */
const getLidMappingValue = (user, direction) => {
  if (!user) return null;

  const key = `${direction}:${user}`;
  if (lidMappingCache.has(key)) return lidMappingCache.get(key);

  try {
    const sessionPath = path.join(
      __dirname,
      '..',
      config.sessionName || 'session'
    );

    const suffix = direction === 'pnToLid' ? '.json' : '_reverse.json';
    const filePath = path.join(sessionPath, `lid-mapping-${user}${suffix}`);

    if (!fs.existsSync(filePath)) {
      lidMappingCache.set(key, null);
      return null;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8') || 'null');

    lidMappingCache.set(key, data || null);
    return data || null;
  } catch {
    lidMappingCache.set(key, null);
    return null;
  }
};

// ===============================
// 🔄 NORMALIZE JID
// ===============================
const normalizeJidWithLid = (jid) => {
  if (!jid) return jid;

  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return jid;

    let { user } = decoded;
    let server = decoded.server || 's.whatsapp.net';

    if (server === 'c.us') server = 's.whatsapp.net';

    // Try LID → PN conversion
    const pnUser = getLidMappingValue(user, 'lidToPn');
    if (pnUser) user = pnUser;

    return jidEncode(user, server);
  } catch {
    return jid;
  }
};

// ===============================
// 🔍 BUILD COMPARABLE IDS
// ===============================
const buildComparableIds = (jid) => {
  if (!jid) return [];

  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user) return [jid];

    const baseServer =
      decoded.server === 'c.us'
        ? 's.whatsapp.net'
        : decoded.server;

    const variants = new Set();

    variants.add(jidEncode(decoded.user, baseServer));

    // PN → LID
    const lidUser = getLidMappingValue(decoded.user, 'pnToLid');
    if (lidUser) {
      variants.add(jidEncode(lidUser, 'lid'));
      variants.add(jidEncode(lidUser, 'hosted.lid'));
    }

    // LID → PN
    const pnUser = getLidMappingValue(decoded.user, 'lidToPn');
    if (pnUser) {
      variants.add(jidEncode(pnUser, 's.whatsapp.net'));
    }

    return [...variants];
  } catch {
    return [jid];
  }
};

// ===============================
// 👤 FIND PARTICIPANT
// ===============================
const findParticipant = (participants = [], userIds) => {
  const targets = (Array.isArray(userIds) ? userIds : [userIds])
    .filter(Boolean)
    .flatMap(id => buildComparableIds(id));

  if (!targets.length) return null;

  return (
    participants.find(p => {
      if (!p) return false;

      const ids = [p.id, p.lid, p.userJid]
        .filter(Boolean)
        .flatMap(id => buildComparableIds(id));

      return ids.some(id => targets.includes(id));
    }) || null
  );
};

module.exports = {
  findParticipant,
  buildComparableIds,
  normalizeJidWithLid,
  getLidMappingValue
};
