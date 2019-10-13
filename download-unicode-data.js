const fs = require('fs')
const https = require('https')
const files = {
  // Complete emoji list with version
  'emoji-order.txt': 'https://unicode.org/emoji/charts-12.0/emoji-ordering.txt',
  // Grouped emoji list with qualifier
  'emoji-group.txt': 'https://unicode.org/Public/emoji/12.0/emoji-test.txt'
}

for (const name of Object.keys(files)) {
  const file = fs.createWriteStream(name)

  const request = https.get(files[name], function(response) {
    response.pipe(file)
  })
}
