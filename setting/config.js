// Module
const fs = require('fs')

global.connect = true
//
global.publicX = true 
//
//System Bot Settings
global.prefa = ['','!','.',',','🐤','🗿'] // Prefix // Not Change

// Bot Identity
global.botName = "DanzBot"
global.dev = "TheDanzPro"

// Links
global.telegram = "https://t.me/MexxTampan"
global.saluran  = "https://whatsapp.com/channel/0029Vb8wNGL7j6g785wX4136"
global.webstore = "https://shop.example.com"

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
