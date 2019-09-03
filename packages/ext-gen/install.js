const path = require('path');
const fs = require('fs')

function boldGreen (s) {
  var boldgreencolor = `\x1b[32m\x1b[1m`
  var endMarker = `\x1b[0m`
  return (`${boldgreencolor}${s}${endMarker}`)
}

var nodeDir = path.resolve(__dirname)
var pkg = (fs.existsSync(nodeDir + '/package.json') && JSON.parse(fs.readFileSync(nodeDir + '/package.json', 'utf-8')) || {});
version = pkg.version
_resolved = pkg._resolved

//"_resolved": "http://npm.sencha.com/@sencha%2fext-gen/-/ext-gen-1.0.1.tgz",
//console.log('\n\n****\n\n' + _resolved + '\n\n****\n\n')

var edition = ''
if(_resolved == undefined) {
  global.isCommunity = true
  edition = `Community`
}
else if (-1 == _resolved.indexOf('community')) {
  global.isCommunity = false
  edition = `Commercial`
}
else {
  global.isCommunity = true
  edition = `Community`
}

var classic = ``
if (global.isCommunity) {
  classic = ``
}
else {
  classic = `ext-gen app --template classicdesktop --classictheme theme-material -n ClassicApp
ext-gen app --template universalclassicmodern --classictheme theme-material --moderntheme theme-material --name CoolUniversalApp
ext-gen app --template classicdesktop --classictheme theme-gray --name GrayDesktopApp
ext-gen app --template classicdesktop --classictheme theme-material --name CoolDesktopApp\n`
}
var welcome = boldGreen(`Welcome to Sencha ExtGen v${version} ${edition} Edition - The Ext JS code generator`)
console.log (`${welcome}

${boldGreen('Quick Start:')}
ext-gen app MyAppName
ext-gen app -i

${boldGreen('Examples:')}
ext-gen app --template universalmodern --moderntheme theme-material --name CoolUniversalApp
ext-gen app --interactive
ext-gen app -t moderndesktop -n ModernApp
${classic}
Run ${boldGreen('ext-gen --help')} to see all options
`)