let version = '15.0'

// npm run download 13.0
if (process.argv[2]) {
  version = Number(process.argv[2]).toFixed(1).toString()
}

const fs = require('fs')
const https = require('https')
const files = {
  // Complete emoji list with version
  'emoji-order.txt': `https://unicode.org/emoji/charts-${version}/emoji-ordering.txt`,
  // Grouped emoji list with qualifier
  'emoji-group.txt': `https://unicode.org/Public/emoji/${version}/emoji-test.txt`,
  // Emoji count
  'emoji-counts.html': `https://unicode.org/emoji/charts-${version}/emoji-counts.html`
}

for (const name of Object.keys(files)) {
  const file = fs.createWriteStream(name)

  https.get(files[name], function(response) {
    response.pipe(file)
  })
}
