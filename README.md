# Unicode Emoji JSON

The primary objective of this library is to provide a up-to-date version of emoji data from Unicode in JSON format, in a number of easily consumable file structures.

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

```
{
  "😀": {
    "name": "grinning_face",
    "group": "Smileys & Emotion",
    "emoji_version": "2.0",
    "unicode_version": "6.1",
    "skin_tone_support": false
  },
  ...
  "👋": {
    "name": "waving_hand",
    "group": "People & Body",
    "emoji_version": "2.0",
    "unicode_version": "6.0",
    "skin_tone_support": true,
    "skin_tone_support_unicode_version": "8.0"
  },
}
```

`data-by-group.json`:

```
{
  "Smileys & Emotion": [
    {
      "emoji": "😀",
      "skin_tone_support": false,
      "name": "grinning_face",
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

```
{
  "light_skin_tone": "🏻",
  "medium_light_skin_tone": "🏼",
  ...
}
```

## Development

1. `npm run download` (`download-unicode-data.js`)

  Download the latest data dump from unicode.org. Update the endpoints in this file when a new version is available.

2. `npm run build` (`build.js`)

  Parse and format the downloaded data into different files. Update the parser if the content format from unicode data has changed.

3. Commit changes.

## Unicode License Agreement

https://www.unicode.org/license.html
