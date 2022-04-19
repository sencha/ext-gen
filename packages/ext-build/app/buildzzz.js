const chalk = require('chalk');
const util = require('../util.js')

class build {
  constructor(options) {
//    console.log(`${chalk.black("[INF] sencha-build app build development")}`)
    util.senchaCmd(['app','build','development']);
  }
}
module.exports = build