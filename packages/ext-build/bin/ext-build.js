#!/usr/bin/env node
const npmScope = '@sencha'
const { spawn } = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra')
const path = require('path')
const util = require('../util.js')
const help = require('../help.js')
const json = require('comment-json');
const PackageJson = require('../package.json');
const commandLineArgs = require('command-line-args')

var prefix = ``
if (require('os').platform() == 'darwin') {
  prefix = `ℹ ｢ext｣:`
}
else {
  prefix = `i [ext]:`
}
const app = `${chalk.green(prefix)} ext-build:`

const optionDefinitions = [
  { name: 'builds', type: String },
  { name: 'debug', alias: 'd', type: Boolean },
  { name: 'force', type: Boolean },
  { name: 'sdk', alias: 's', type: String },
  { name: 'template', alias: 't', type: String },
  { name: 'profile', alias: 'p', type: String },
  { name: 'viewname', alias: 'v', type: String },
  { name: 'include-scss', alias: 'i', type: String },
  { name: 'parms', type: String, multiple: true, defaultOption: true },
]

//try {

//   child.stdout.on('data', (data) => {
// //    var substrings = ['[ERR]', '[WRN]', '[INF] Processing', "[INF] Server", "[INF] Writing content", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"]
// //    if (substrings.some(function(v) { return data.indexOf(v) >= 0; })) { 
//       var str = data.toString()
//       var s = str.replace(/\r?\n|\r/g, " ")
//       console.log(`${s}`) 
// //    }
//   });

  //debug = false
  console.log(chalk.green('Sencha ExtBuild v' + PackageJson.version))

  var CurrWorkingDir = process.cwd()
  var SenchaCmdDir = util.getSenchaCmdPath()
  var NodeAppBinDir = path.resolve(__dirname)
  var TemplatesDir = '/ext-templates' 
  var NodeAppTemplatesDir = path.join(NodeAppBinDir + '/..' + TemplatesDir) 

  const cmdLine = commandLineArgs(optionDefinitions)
  //console.log(cmdLine)
  //if(cmdLine.debug) { debug = true } else { debug = false }

  //var SenchaCmdTemplatesDir = '/plugins/ext/current'
  //var ApplicationTemplatesDir = TemplatesDir + '/Application'
  var NodeDir = process.argv[0]
  var AppExe = process.argv[1]

  //console.log(NodeDir)
  //console.log(AppExe)


  var Category = ''
  try { Category = cmdLine.parms[0] }
  catch(e) { Category = 'info' }

  var Command = ''
  try { Command = cmdLine.parms[1] }
  catch(e) { Command = '' }

  // util.dbgLog('NodeDir: ' + NodeDir);
  // util.dbgLog('AppExe: ' + AppExe);
  // util.dbgLog('Category: ' + Category);
  // util.dbgLog('Command: ' + Command);
  // util.dbgLog('CurrWorkingDir: ' + CurrWorkingDir);
  // util.dbgLog('NodeAppBinDir: ' + NodeAppBinDir);
  // util.dbgLog('SenchaCmdDir: ' + SenchaCmdDir);
  // util.dbgLog('TemplatesDir: ' + TemplatesDir);
  // util.dbgLog('NodeAppTemplatesDir: ' + NodeAppTemplatesDir);

//  console.log(Category)
//  console.log(Command)

  switch(Category) {
    case 'app': case 'a':
      switch(Command) {
        case 'watch': case 'w':
          var watch = require('../app/watch.js')
          new watch(cmdLine)
          break;
        case 'build': case 'b':
          var build = require('../app/buildAsync.js')
          //new build(cmdLine)
          new build(cmdLine).executeAsync().then(function() {})
          break;
        case 'refresh': case 'r':
          var refresh = require('../app/refresh.js')
          new refresh(cmdLine)
          break;
        default:
          throw util.err('Unknown command: "' + command + '" for category "' + category + '"')
      }
      break;
    case 'info': case 'help':
      console.log(help.infoText)
      break;
    case 'generate': case 'gen': case 'g':
      switch(Command) {
        case 'storepackage': case 'sp':
          require('../generate/storepackage.js').init(CurrWorkingDir, SenchaCmdDir, cmdLine, NodeAppTemplatesDir)
          break;
        case 'viewpackage': case 'vp':
          require('../generate/viewpackage.js').init(CurrWorkingDir, SenchaCmdDir, cmdLine, NodeAppTemplatesDir)
          break;
        case 'application': case 'app':  case 'a':

          //cmdLine.cmdVersion = '6.6.0.11' // cmdVersion,
          //cmdLine.frameworkVersion = '6.6.0.195' //frameworkVersion,

          

          var answers = {
            'appName': 'MyApp',
            'classicTheme': 'theme-triton',
            'modernTheme': 'theme-material',
            'template': 'classicdesktop',
            'templateFolderName': './'
          }


          var options = { 
            parms: [ 'generate', 'app', answers['appName'], './' + answers['appName'] ],
            sdk: `node_modules/${npmScope}/ext`,
            template: answers['template'],
            classicTheme: answers['classicTheme'],
            modernTheme: answers['modernTheme'],
            templateFull: answers['templateFolderName'],
//            cmdVersion: cmdVersion,
//            frameworkVersion: frameworkVersion,
            force: false
          }
          var generateApp = require(`${npmScope}/ext-build-generate-app/generateApp.js`)
          new generateApp(options)





          //var generateApp = require('../generate/app.js')
          //new generateApp(cmdLine)

          console.log(chalk.green('\nYour new Ext JS project is ready!\n'))
          console.log(chalk.bold(`cd ${cmdLine.parms[2]} then "ext-build app watch" to run the development build.\n`))
        

          break;
        default:
          throw util.err('Unknown command: "' + command + '" for category "' + category + '"')
      }
      break;
    default:
      util.senchaCmd([...cmdLine.parms]);
      //throw util.err('Unknown Category: "' + Category + '"')
  }
// }
// catch(e) {
// 	console.log(util.err(e))
// 	//if (debug) {util.dbgLog(e)}
// 	if (debug) {console.log(e)}
	
// }
