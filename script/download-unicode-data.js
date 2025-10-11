let version = '17.0'

if (process.argv[2]) {
  version = Number(process.argv[2]).toFixed(1).toString()
}

const fs = require('fs')
const https = require('https')
const files = {
  'emoji-order.txt': `https://unicode.org/emoji/charts-${version}/emoji-ordering.txt`,
  'emoji-group.txt': `https://unicode.org/Public/emoji/${version}/emoji-test.txt`,
  'emoji-counts.html': `https://unicode.org/emoji/charts-${version}/emoji-counts.html`
}

for (const name of Object.keys(files)) {
  const file = fs.createWriteStream(name)
  https.get(files[name], function(response) {
    response.pipe(file)
  })
}
