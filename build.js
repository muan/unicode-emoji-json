const fs = require('fs')
const orderedEmojiData = fs.readFileSync('./emoji-order.txt', 'utf-8')
const groupedEmojiData = fs.readFileSync('./emoji-group.txt', 'utf-8')
const VARIATION_16 = String.fromCodePoint(0xfe0f)
const SKIN_TONE_VARIATION_DESC = /\sskin\stone(?:,|$)/

// Final data holder
const orderedEmoji = []
const dataByEmoji = {}
const dataByGroup = {}
const emojiComponents = {}

// The group data tells if the emoji is one of the following:
//   component
//   fully-qualified
//   minimally-qualified
//   unqualified
//
// We only want fully-qualified emoji in the output data
const GROUP_REGEX = /^#\sgroup:\s(?<name>.+)/
const EMOJI_REGEX = /^[^#]+;\s(?<type>[\w-]+)\s+#\s(?<emoji>\S+)\s(?<desc>.+)/
let currentGroup = null

groupedEmojiData.split('\n').forEach(line => {
  const groupMatch = line.match(GROUP_REGEX)
  if (groupMatch) {
    currentGroup = groupMatch.groups.name
  } else {
    const emojiMatch = line.match(EMOJI_REGEX)
    if (emojiMatch) {
      const {groups: {type, emoji, desc}} = emojiMatch
      if (type === 'fully-qualified') {
        if (line.match(SKIN_TONE_VARIATION_DESC)) return
        dataByEmoji[emoji] = {group: currentGroup}
      } else if (type === 'component') {
        emojiComponents[desc.replace(/[\W|_]+/g, '_').toLowerCase()] = emoji
      }
    }
  }
})

// U+1F44B ; 6.0 # 👋 waving hand
//          |1--| |2-|3----------|
//
// U+1F442 U+1F3FB ; 8.0 # 👂🏻 ear: light skin tone
//                  |1--| |2-|3--||4--------------|
//
// U+1F469 U+200D U+1F467 U+200D U+1F467 ; 6.0 # 👩‍👧‍👧 family: woman, girl, girl
//                                        |1--| |2-|3-----||4----------------|
//
const ORDERED_EMOJI_REGEX = /.+\s;\s(?<version>[0-9.]+)\s#\s(?<emoji>\S+)\s(?<name>[^:]+)(?::\s)?(?<desc>.+)?/

// Not sure why these are listed as `⊖gbeng`, `⊖gbsct`, `⊖gbwls`
const nameExceptions = {
  'flag_gbeng': 'flag_england',
  'flag_gbsct': 'flag_scotland',
  'flag_gbwls': 'flag_wales'
}

let currentEmoji = null

orderedEmojiData.split('\n').forEach(line => {
  if (line.length === 0) return
  const match = line.match(ORDERED_EMOJI_REGEX)
  if (!match) return

  const {groups: {version, emoji, name, desc}} = match
  const isSkinToneVariation = desc && !!desc.match(SKIN_TONE_VARIATION_DESC)
  // 'flag: St. Kitts & Nevis' -> 'flag_st_kitts_nevis'
  // 'family: woman, woman, boy, boy' -> 'family_woman_woman_boy_boy'
  const transformedName = (desc && !isSkinToneVariation ? [name, desc].join('_') : name).replace(/[\W|_]+/g, '_').toLowerCase()
  const finalName = nameExceptions[transformedName] || transformedName
  if (isSkinToneVariation) {
    dataByEmoji[currentEmoji].fitzpatrick_scale = true
    dataByEmoji[currentEmoji].fitzpatrick_scale_version = version
  } else {
    // Workaround for ordered data missing VARIATION_16 (smiling_face)
    emojiWithOptionalVariation16 = dataByEmoji[emoji] ? emoji : emoji + VARIATION_16
    const emojiEntry = dataByEmoji[emojiWithOptionalVariation16]
    if (!emojiEntry) {
      if (Object.values(emojiComponents).includes(emoji)) return
      throw `${emoji} entry from emoji-order.txt match not found in emoji-group.txt`
    }
    currentEmoji = emojiWithOptionalVariation16
    orderedEmoji.push(currentEmoji)
    dataByEmoji[currentEmoji].name = finalName
    dataByEmoji[currentEmoji].version = version
    dataByEmoji[currentEmoji].fitzpatrick_scale = false
  }
})

for (const emoji of orderedEmoji) {
  const {group, fitzpatrick_scale, fitzpatrick_scale_version, name, version} = dataByEmoji[emoji]
  const existingGroup = dataByGroup[group]
  if (!existingGroup) dataByGroup[group] = []
  dataByGroup[group].push({
    emoji,
    fitzpatrick_scale,
    fitzpatrick_scale_version,
    name,
    version
  })
}

// {
//   "😀": {
//     "group": "Smileys & Emotion",
//     "name": "grinning_face",
//     "version": "6.1",
//     "fitzpatrick_scale": false
//   },
//   ...
// }
fs.writeFileSync('data-by-emoji.json', JSON.stringify(dataByEmoji, null, 2))

// {
//   "Smileys & Emotion": [
//     {
//       "emoji": "😀",
//       "fitzpatrick_scale": false,
//       "name": "grinning_face",
//       "version": "6.1"
//     },
//   ],
//   ...
// }
fs.writeFileSync('data-by-group.json', JSON.stringify(dataByGroup, null, 2))

// [
//   "😀",
//   "😃",
//   ...
// ]
fs.writeFileSync('data-ordered-emoji.json', JSON.stringify(orderedEmoji, null, 2))

// {
//   "light_skin_tone": "🏻",
//   "medium_light_skin_tone": "🏼",
//   ...
// }
fs.writeFileSync('data-emoji-components.json', JSON.stringify(emojiComponents, null, 2))
