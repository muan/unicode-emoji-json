# Unicode Emoji JSON

The primary objective of this library is to provide a up-to-date version of emoji data from Unicode in JSON format, in a number of easily consumable file structures.

## Files

`data-by-emoji.json`:

```
{
  "😀": {
    "group": "Smileys & Emotion",
    "name": "grinning_face",
    "version": "6.1",
    "fitzpatrick_scale": false
  },
  ...
}
```

`data-by-group.json`:

```
{
  "Smileys & Emotion": [
    {
      "emoji": "😀",
      "fitzpatrick_scale": false,
      "name": "grinning_face",
      "version": "6.1"
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
