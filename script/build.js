'use strict';
const fs = require('fs');
const path = require('path');

const VARIATION_16 = String.fromCodePoint(0xfe0f);
const SKIN_TONE_VARIATION_DESC = /\sskin\stone(?:,|$)/u;
const GROUP_REGEX = /^#\s*group:\s*(?<name>.+?)\s*$/u;
const SUBGROUP_REGEX = /^#\s*subgroup:/u;
const EMOJI_REGEX = /^[^#]+;\s*(?<type>[\w-]+)\s*#\s*(?<emoji>\S+)\s*E(?<emojiversion>[\d.]+)\s*(?<desc>.+)$/u;
const ORDERED_EMOJI_REGEX = /.+\s;\s*(?<version>\d+(?:\.\d+)?)\s*#\s*(?<emoji>\S+)\s*(?<name>[^:]+?)(?::\s*(?<desc>.+))?\s*$/u;

const orderedEmoji = [];
const dataByEmoji = {};
const groupMap = new Map();
const emojiComponentsBySlug = {};
const emojiComponentsSet = new Set();

function normalizeEmojiKey(e) {
  if (dataByEmoji[e]) return e;
  if (dataByEmoji[e + VARIATION_16]) return e + VARIATION_16;
  if (e.endsWith(VARIATION_16) && dataByEmoji[e.slice(0, -1)]) return e.slice(0, -1);
  return e;
}

function slugify(str) {
  const map = [[/\*/g, 'asterisk'], [/#/g, 'hash'], [/&/g, 'and'], [/\+/g, 'plus']];
  let s = String(str);
  for (const [re, rep] of map) s = s.replace(re, rep);
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.+?\)/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toLowerCase();
}

function ensureGroup(name) {
  if (!groupMap.has(name)) groupMap.set(name, { name, slug: slugify(name), emojis: [] });
  return groupMap.get(name);
}

function readUtf8(p) {
  return fs.readFileSync(p, 'utf-8');
}

function parseGrouped(groupedText) {
  let currentGroup = null;
  const anomalies = [];
  for (const raw of groupedText.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('##') || line.startsWith('# ')) continue;
    const g = line.match(GROUP_REGEX);
    if (g) {
      currentGroup = g.groups.name;
      continue;
    }
    if (SUBGROUP_REGEX.test(line)) continue;
    const m = line.match(EMOJI_REGEX);
    if (!m) continue;
    const { type, emoji, desc, emojiversion } = m.groups;
    if (type === 'fully-qualified') {
      if (SKIN_TONE_VARIATION_DESC.test(desc)) continue;
      const key = normalizeEmojiKey(emoji);
      dataByEmoji[key] = {
        name: null,
        slug: null,
        group: currentGroup,
        emoji_version: emojiversion,
        unicode_version: null,
        skin_tone_support: null
      };
    } else if (type === 'component') {
      const s = slugify(desc);
      emojiComponentsBySlug[s] = emoji;
      emojiComponentsSet.add(emoji);
    }
  }
  if (!currentGroup) anomalies.push('No group headers detected.');
  return anomalies;
}

function parseOrdered(orderedText) {
  const anomalies = [];
  let currentEmojiKey = null;
  for (const raw of orderedText.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(ORDERED_EMOJI_REGEX);
    if (!m) continue;
    const { version, emoji, name, desc } = m.groups;
    const isTone = !!(desc && SKIN_TONE_VARIATION_DESC.test(desc));
    const fullName = desc && !isTone ? `${name} ${desc}` : name;
    const keyCandidate = normalizeEmojiKey(emoji);
    const entry = dataByEmoji[keyCandidate];
    if (isTone) {
      if (currentEmojiKey && dataByEmoji[currentEmojiKey]) {
        dataByEmoji[currentEmojiKey].skin_tone_support = true;
        dataByEmoji[currentEmojiKey].skin_tone_support_unicode_version =
          dataByEmoji[currentEmojiKey].skin_tone_support_unicode_version || version;
      }
      continue;
    }
    if (!entry) {
      if (emojiComponentsSet.has(emoji)) continue;
      anomalies.push(`Ordered emoji "${emoji}" not found in grouped list (name="${name}")`);
      continue;
    }
    currentEmojiKey = keyCandidate;
    orderedEmoji.push(currentEmojiKey);
    entry.name = fullName;
    entry.slug = slugify(fullName);
    entry.unicode_version = version;
    if (entry.skin_tone_support == null) entry.skin_tone_support = false;
  }
  return anomalies;
}

function buildOutputs() {
  for (const emoji of orderedEmoji) {
    const {
      group,
      skin_tone_support,
      skin_tone_support_unicode_version,
      name,
      slug,
      emoji_version,
      unicode_version
    } = dataByEmoji[emoji];
    const grp = ensureGroup(group || 'Ungrouped');
    grp.emojis.push({
      emoji,
      skin_tone_support,
      skin_tone_support_unicode_version,
      name,
      slug,
      unicode_version,
      emoji_version
    });
  }
  return Array.from(groupMap.values());
}

function writeJson(outPath, filename, obj) {
  const full = path.join(outPath, filename);
  fs.writeFileSync(full, JSON.stringify(obj, null, 2), 'utf-8');
  return full;
}

function main({ groupedPath = './emoji-group.txt', orderedPath = './emoji-order.txt', outDir = '.' } = {}) {
  const groupedEmojiData = readUtf8(groupedPath);
  const orderedEmojiData = readUtf8(orderedPath);
  const anomalies = [];
  anomalies.push(...parseGrouped(groupedEmojiData));
  anomalies.push(...parseOrdered(orderedEmojiData));
  const dataByGroup = buildOutputs();
  const files = {
    byEmoji: writeJson(outDir, 'data-by-emoji.json', dataByEmoji),
    byGroup: writeJson(outDir, 'data-by-group.json', dataByGroup),
    ordered: writeJson(outDir, 'data-ordered-emoji.json', orderedEmoji),
    components: writeJson(outDir, 'data-emoji-components.json', emojiComponentsBySlug)
  };
  if (anomalies.length)
    console.warn(`[emoji-build] Completed with ${anomalies.length} anomalies:\n- ${anomalies.join('\n- ')}`);
  console.log('[emoji-build] Wrote:', files);
}

main({
  groupedPath: process.env.EMOJI_GROUP_PATH || './emoji-group.txt',
  orderedPath: process.env.EMOJI_ORDER_PATH || './emoji-order.txt',
  outDir: process.env.EMOJI_OUT_DIR || '.'
});
