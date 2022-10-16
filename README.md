# Unicode Emoji JSON [![Test status](https://github.com/muan/unicode-emoji-json/workflows/Node%20CI/badge.svg)](https://github.com/muan/unicode-emoji-json/actions?query=workflow%3A%22Node+CI%22)

This library provides a up-to-date version of emoji data from Unicode in JSON format, in a number of easily consumable file structures.

Check out [`muan/emojilib`](https://github.com/muan/emojilib) for emoji keyword pairings for extended searchability.

## Details

### RGI only

This data does not contain minimally-qualified and unqualified emoji.

> RGI: Recommended for General Interchange. A subset of emojis which is likely to be widely supported across multiple platforms.

> Minimally-qualified or unqualified emoji zwj sequences may be handled in the same way as their fully-qualified forms; the choice is up to the implementation.

Full description can be found at http://www.unicode.org/reports/tr51/.

### Skin tone variations

Emoji's skin tone variations are consolidated into one base entry, with a `skin_tone_support` flag on them.

This means one entry of 👋 represents its 5 variations– 👋🏻, 👋🏼, 👋🏽, 👋🏾, 👋🏿; while raw unicode data list them as individual emoji entries.

## Files

`data-by-emoji.json`:

```json
{
  "😀": {
    "name": "grinning face",
    "slug": "grinning_face",
    "group": "Smileys & Emotion",
    "emoji_version": "2.0",
    "unicode_version": "6.1",
    "skin_tone_support": false
  },
  ...
  "👋": {
    "name": "waving hand",
    "slug": "waving_hand",
    "group": "People & Body",
    "emoji_version": "2.0",
    "unicode_version": "6.0",
    "skin_tone_support": true,
    "skin_tone_support_unicode_version": "8.0"
  },
}
```

`data-by-group.json`:

```json
{
  "Smileys & Emotion": [
    {
      "emoji": "😀",
      "skin_tone_support": false,
      "name": "grinning face",
      "slug": "grinning_face",
      "unicode_version": "6.1",
      "emoji_version": "2.0"
    },
  ],
  ...
}
```

`data-ordered-emoji.json`:

```
[
  "😀",
  "😃",
  ...
]
```

`data-emoji-components.json`:

```json
{
  "light_skin_tone": "🏻",
  "medium_light_skin_tone": "🏼",
  ...
}
```

## Development

1. `npm install`

  Install dependencies.

2. `npm run download`

  Download the latest data dump from unicode.org. Update the version variable in this file when a new version is available. Experiment with a version by passing an argument for version number: `npm run download 13.0`.

3. `npm run build`

  Parse and format the downloaded data into different files for distribution. This script also generates `stats.json` for use in test. Update the parser if the content format from unicode data has changed.

4. `npm test`

  Run test that ensures the build data matches the count of emoji parsed from the data source.

  A common People's category test failure after an Emoji version upgrade might be that [there are new dual skin tone emoji unaccounted for](https://github.com/muan/unicode-emoji-json/blob/fc40d2e86da1c0ba8a672176f85e4363cd0dadd9/script/generate-emoji-counts.js#L11). Verify this by reading through the change log and see if there are any emoji that can be modified with two skin tone modifiers and add them to `generate-emoji-counts.js` then run `npm run build` which will update `stats.json`; then run the test again. This isn't automated currently. [See #3](https://github.com/muan/unicode-emoji-json/issues/3).

## Unicode License Agreement

https://www.unicode.org/license.html
