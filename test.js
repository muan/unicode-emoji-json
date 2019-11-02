const fs = require('fs')
const test = require('tape')

// https://unicode.org/emoji/charts-12.1/emoji-counts.html
const stats = {
  // Bottom right table cell
  total: 3187,
  // (Ⓒ ‧ 🏿) + (Ⓩ ‧ 🦰 ‧ 🏿) + (Ⓩ ‧ ♀ ‧ 🏿) + (Ⓩ ‧ 👩 ‧ 🏿) + (Ⓩ ‧ 👪 ‧ 🏿) = 570 + 60 + 440 + 285 + 85
  skin_tone_modifiable: 1440,
  // Manual counted (people holding hands)
  dual_skin_tone_support: 4,
  component: 9,
  groups: {
    'Smileys & Emotion': 149,
    'People & Body': 1774,
    'Animals & Nature': 127,
    'Food & Drink': 121,
    'Travel & Places': 210,
    'Activities': 79,
    'Objects': 233,
    'Symbols': 217,
    'Flags': 268
  }
}

stats.total_without_skin_tone_variations = stats.total - stats.skin_tone_modifiable - stats.component


const OUTPUT_FILES = [
  'data-by-emoji.json',
  'data-by-group.json',
  'data-ordered-emoji.json',
  'data-emoji-components.json'
]

test('data-ordered-emoji.json', function(t) {
  const data = require('./data-ordered-emoji.json')
  t.equal(data.length, stats.total_without_skin_tone_variations, 'Correct number of total emoji.')
  t.end()
})

test('data-emoji-components.json', function(t) {
  const data = require('./data-emoji-components.json')
  t.equal(Object.keys(data).length, stats.component, 'Correct number of component emoji.')
  t.end()
})

test('data-by-emoji.json', function(t) {
  const data = require('./data-by-emoji.json')
  t.equal(Object.keys(data).length, stats.total_without_skin_tone_variations, 'Correct number of total emoji.')
  t.end()
})

test('data-by-group.json', function(t) {
  const data = require('./data-by-group.json')
  for (const groupName in stats.groups) {
    if (groupName === 'People & Body') {
      // Ensure emoji count adds up to expected number of variations
      //
      // Each of these has 1 + 5 more skin tone variation sequences
      const emojiWithSkinToneSupport = data[groupName].filter(entry => entry.skin_tone_support).length
      // Each of these has 1 + 5 * 5 more skin tone variation sequences
      const dualSkinToneSupport = stats.dual_skin_tone_support
      const countWithSkinVariation = data[groupName].length + (emojiWithSkinToneSupport - dualSkinToneSupport) * 5 + dualSkinToneSupport * 5 * 5
      t.equal(countWithSkinVariation, stats.groups[groupName], `Correct number of ${groupName} emoji.`)
    } else {
      t.equal(data[groupName].length, stats.groups[groupName], `Correct number of ${groupName} emoji.`)
    }
  }
  t.end()
})
