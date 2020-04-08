#! /usr/bin/env node
//let run = require('./util').run

const semver = require("semver")
const npmScope = '@sencha'
const appMigrate = require('./appMigrate.js')
const movetolatest = require('./movetolatest.js')
require('./XTemplate/js')

const util = require('./util.js')
const path = require('path');
const fs = require('fs-extra');
const { kebabCase } = require('lodash')
const commandLineArgs = require('command-line-args')
const List = require('prompt-list')
const Input = require('prompt-input')
const Confirm = require('prompt-confirm')
global.isCommunity = true

function boldGreen (s) {
  var boldgreencolor = `\x1b[32m\x1b[1m`
  var endMarker = `\x1b[0m`
  return (`${boldgreencolor}${s}${endMarker}`)
}
function boldRed (s) {
  var boldredcolor = `\x1b[31m\x1b[1m`
  var endMarker = `\x1b[0m`
  return (`${boldredcolor}${s}${endMarker}`)
}
function getPrefix () {
  var prefix
  if (require('os').platform() == 'darwin') {
    prefix = `ℹ ｢ext｣:`
  }
  else {
    prefix = `i [ext]:`
  }
  return prefix
}

var app =(`${boldGreen(getPrefix())} ext-gen:`)

var answers = {
  'seeDefaults': null,
  'useDefaults': null,
  'appName': null,
  'classic': null,
  'modern': null,
  'universal': null,
  'classicTheme': null,
  'modernTheme': null,
  'templateType': null,
  'template': null,
  'templateFolderName': null,
  'packageName': null,
  'version': null,
  'description': null,
  'repositoryURL': null,
  'keywords': null,
  'authorName': null,
  'license': null,
  'bugsURL': null,
  'homepageURL': null,
  'createNow': null,
}

const optionDefinitions = [
  { name: 'command', defaultOption: true },
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'interactive', alias: 'i', type: Boolean },
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'defaults', alias: 'd', type: Boolean },
  { name: 'auto', alias: 'a', type: Boolean },
  { name: 'name', alias: 'n', type: String },
  { name: 'template', alias: 't', type: String },
  { name: 'moderntheme', alias: 'm', type: String },
  { name: 'classictheme', alias: 'c', type: String },
]

var version = ''
var edition = ''
var _resolved = ''

var config = {}
var cmdLine = {}
var globalError = 0

main()
async function main() {
  try {
  //await run (`npm view @sencha/ext version`)
  //await run (`npm --registry https://npm.sencha.com whoami`)
  stepStart()
  }
  catch (e) {
    console.log(e)
  }
}

function stepStart() {
  var nodeDir = path.resolve(__dirname)
  var pkg = (fs.existsSync(nodeDir + '/package.json') && JSON.parse(fs.readFileSync(nodeDir + '/package.json', 'utf-8')) || {});
  version = pkg.version
  _resolved = pkg._resolved
  if (_resolved == undefined) {
    edition = `Professional`
  }
  else {
    if (-1 == _resolved.indexOf('community')) {
      global.isCommunity = false
      edition = `Professional`
    }
    else {
      global.isCommunity = true
      edition = `Community`
    }
  }

  var data = fs.readFileSync(nodeDir + '/config.json')
  config = JSON.parse(data)

  console.log(boldGreen(`\nSencha ExtGen v${version} ${edition} Edition - The Ext JS code generator`))
  console.log('')

  let mainDefinitions = [{ name: 'command', defaultOption: true }]
  const mainCommandArgs = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
//  console.log('');console.log(`mainCommandArgs: ${JSON.stringify(mainCommandArgs)}`)
  var mainCommand = mainCommandArgs.command
//  console.log(`mainCommand: ${JSON.stringify(mainCommand)}`)
  switch(mainCommand) {
    case undefined:
      let argv = mainCommandArgs._unknown || []
      if (argv.length == 0 ){
//        console.log(`cmdLine: ${JSON.stringify(cmdLine)}`);console.log(`\n\nShortHelp`)
        stepShortHelp()
        break;
      }
      if (argv.length > 1) {
        console.log(`${app} ${boldRed('[ERR]')} too many switches: ${argv.toString()}`)
      }
      else {
        cmdLine = commandLineArgs(optionDefinitions, { argv: argv, stopAtFirstUnknown: true })
//        console.log(`cmdLine: ${JSON.stringify(cmdLine)}`);console.log(`\n\nstep00`)
        stepCheckCmdLine()
      }
      break;
    case 'app':
      cmdLine.command = mainCommand
      let appArgs = mainCommandArgs._unknown || []
//      console.log(`appArgs: ${JSON.stringify(appArgs)}`)
      let appDefinitions = [{ name: 'appName', defaultOption: true }]
      const appCommandArgs = commandLineArgs(appDefinitions, { argv: appArgs, stopAtFirstUnknown: true })
//      console.log(`appCommandArgs: ${JSON.stringify(appCommandArgs)}`)
      var appName = appCommandArgs.appName
//      console.log(`appName: ${JSON.stringify(appName)}`)
      if (appName != undefined) {
        cmdLine.name = appName
      }
      let appSubArgs = appCommandArgs._unknown || []
//      console.log(`appSubArgs: ${JSON.stringify(appSubArgs)}`)
      if (appSubArgs.length == 0) {
//        console.log(`cmdLine: ${JSON.stringify(cmdLine)}`);console.log(`\n\nstep00`)
        stepCheckCmdLine()
      }
      else {
        var command = cmdLine.command
        var name = ''
        if (cmdLine.name != undefined) {
          name = cmdLine.name
        }
        try{
          cmdLine = commandLineArgs(optionDefinitions, { argv: appSubArgs, stopAtFirstUnknown: false })
        }
        catch (e) {
          console.log(`${app} ${boldRed('[ERR]')} ${JSON.stringify(e)}`)
          return
        }
        cmdLine.command = command
        if (name != '') {
          cmdLine.name = name
        }
//        console.log(`cmdLine: ${JSON.stringify(cmdLine)}`)
//        console.log(`\n\nstep00`)
        stepCheckCmdLine()
      }
      break;
    case 'viewpackage':
    case 'vp':
      //cmdLine.command = mainCommand
      let viewArgs = mainCommandArgs._unknown || []
      let viewDefinitions = [{ name: 'name', defaultOption: true },{ name: 'template', alias: 't', type: String}]
      const viewCommandArgs = commandLineArgs(viewDefinitions, { argv: viewArgs, stopAtFirstUnknown: true })
      var template = ''
      var name = viewCommandArgs.name
      if (viewCommandArgs.template == undefined) {
        template = 'basic'
      }
      else {
        template = viewCommandArgs.template
      }




      //let argv2 = mainCommandArgs._unknown || []
      //cmdLine = commandLineArgs(optionDefinitions, { argv: argv2, stopAtFirstUnknown: true })
      cmdLine = {}
      cmdLine.parms = ['a','b','desktop',name, template]
      var CurrWorkingDir = process.cwd()
      //var NodeAppBinDir = path.resolve(__dirname)
      //var TemplatesDir = '/ext-templates'

      require('./generate/viewpackage.js').init(CurrWorkingDir, cmdLine)
      //return
      break;
      case 'movetolatest':
        callmovetolatest();
        break;
      case 'migrate':
          migrate();
          break;
    default:
      console.log(`${app} ${boldRed('[ERR]')} command not available: '${mainCommand}'`)
  }
}


async function callmovetolatest()
{
 console.log('movetolatest started');
  await movetolatest.movetolatestfunction();
  //console.log('Upgrade done . Please run npm install and then npm run all');
  console.log('movetolatest ended');

}

async function migrate()
{
  console.log('Migration to Open Tools started...');
  await appMigrate.migrateApp();
  console.log(boldGreen('\nMigration to Open Tools ended'));
  console.log(boldGreen('\nrun `npm install` to install the necessary Open Tooling dependencies'));
  console.log('\nNote: your build profiles in app.json may be different than those pre-configured in your new package.json.');
  console.log('If you are not using desktop or phone build profiles, such as in a universal application where the profiles generated for you are modern and classic,');
  console.log('update the different build scripts in the scripts section fo package.json. The --env.profile=<your_build_profile> should be updated to match a valid profile in your app.json.');
  console.log(boldGreen('\nPlease review documentation at https://docs.sencha.com'));
}

function stepCheckCmdLine() {
//  console.log('step00')
//  console.log(`cmdLine: ${JSON.stringify(cmdLine)}, length: ${Object.keys(cmdLine).length}, process.argv.length: ${process.argv.length}`)

  setDefaults()
  if (cmdLine.verbose == true) {
    process.env.EXTGEN_VERBOSE = 'true'
  }
  else {
    process.env.EXTGEN_VERBOSE = 'false'
  }
  if (cmdLine.help == true) {
    stepHelpGeneral()
  }
  else if (cmdLine.command == undefined) {
    console.log(`${app} ${boldRed('[ERR]')} no command specified (app, view)`)
  }
  else if (cmdLine.command == 'app' && Object.keys(cmdLine).length == 1) {
    console.log(`${app} ${boldRed('[ERR]')} at least 1 parameter is needed`)
    return
  }
  else if (cmdLine.defaults == true) {
    displayDefaults()
  }
  else if (cmdLine.command != 'app') {
    console.log(`${app} ${boldRed('[ERR]')} unknown command '${cmdLine.command}'`)
  }
  else if (cmdLine.interactive == true && cmdLine.command == 'app') {
    stepSeeDefaults()
  }
  else if (process.argv.length == 2) {
    stepShortHelp()
  }

  else if (cmdLine.auto == true) {
    stepGo()
  }
  else if (cmdLine.name != undefined) {
    cmdLine.auto = true
    stepGo()
  }
  else {
    stepHelpGeneral()
  }
}

function stepSeeDefaults() {
  new Confirm({
    message:
    `would you like to see the defaults for package.json?`,
    default: config.seeDefaults
  }).run().then(answer => {
    answers['seeDefaults'] = answer
    if(answers['seeDefaults'] == true) {
      displayDefaults()
      stepCreateWithDefaults()
    }
    else {
      stepCreateWithDefaults()
    }
  })
}

function stepCreateWithDefaults() {
  new Confirm({
    message: 'Would you like to create a package.json file with defaults?',
    default: config.useDefaults
  }).run().then(answer => {
    answers['useDefaults'] = answer
    if(answers['useDefaults'] == true) {
      setDefaults()
      stepNameYourApp()
    }
    else {
      stepNameYourApp()
    }
  })
}

function stepNameYourApp() {
  new Input({
    message: 'What would you like to name your Ext JS app?',
    default:  config.appName
  }).run().then(answer => {
    answers['appName'] = answer
    answers['packageName'] = kebabCase(answers['appName'])
    config.description =  `${answers['packageName']} description for Ext JS app ${answers['appName']}`
    step03()
  })
}

function step03() {
  new List({
    message: 'What type of Ext JS template do you want?',
    choices: ['make a selection from a list','type a folder name'],
    default: 'make a selection from a list'
  }).run().then(answer => {
    answers['templateType'] = answer
    if(answers['templateType'] == 'make a selection from a list') {
      step04()
    }
    else {
      step05()
    }
  })
}

function step04() {
  var choices = []
  if (global.isCommunity) {
    choices = ['moderndesktop', 'universalmodern', 'moderndesktopminimal']
  }
  else {
    choices = ['classicdesktop', 'classicdesktoplogin', 'moderndesktop', 'moderndesktopminimal', 'universalclassicmodern', 'universalmodern']
  }

  new List({
    message: 'What Ext JS template would you like to use?',
    choices: choices,
    default: 'moderndesktop'
  }).run().then(answer => {
    answers['classic'] = false
    answers['modern'] = false
    answers['universal'] = false
    if (answer.includes("classic")) {
      answers['classic'] = true
    }
    if (answer.includes("modern")) {
      answers['modern'] = true
    }
    if (answer.includes("universal")) {
      answers['universal'] = true
    }
    answers['template'] = answer
    if(answers['useDefaults'] == true) {
      stepGo()
    }
    else {
      step05()
    }
  })
}

function step05() {
  new Input({
    message: 'What is the Template folder name?',
    default:  config.templateFolderName
  }).run().then(answer => {
    answers['templateFolderName'] = answer
    if(answers['useDefaults'] == true) {
      stepGo()
    }
    else {
      stepPackageName()
    }
  })
}

function stepPackageName() {
  new Input({
    message: 'What would you like to name the npm Package?',
    default:  kebabCase(answers['appName'])
  }).run().then(answer => {
    answers['packageName'] = kebabCase(answer)
    config.description =  `${answers['packageName']} description for Ext JS app ${answers['appName']}`
    stepVersion()
  })
}

function stepVersion() {
  new Input({
    message: 'What version is your Ext JS application?',
    default: config.version
  }).run().then(answer => {
    if (semver.valid(answer) == null) {
      console.log('version is not a valid format, must be 0.0.0')
      stepVersion()
    }
    else {
      answers['version'] = answer
      stepDescription()
    }
  })
}

function stepDescription() {
  new Input({
    message: 'What is the description?',
    default: config.description
  }).run().then(answer => {
    answers['description'] = answer
    stepRepositoryURL()
  })
}

function stepRepositoryURL() {
  new Input({
    message: 'What is the GIT repository URL?',
    default: config.repositoryURL
  }).run().then(answer => {
    answers['repositoryURL'] = answer
    stepKeywords()
  })
}

function stepKeywords() {
  new Input({
    message: 'What are the npm keywords?',
    default: config.keywords
  }).run().then(answer => {


    var theKeywords = "";
    var keywordArray = answer.split(" ");
     for (var i = 0; i < keywordArray.length; i++) {
        theKeywords += '"' + keywordArray[i] + '",'
    }
    answers['keywords'] = theKeywords.slice(0, -1);
    //answers['keywords'] = processKeywords(answer)

    stepAuthorName()

  })
}

function stepAuthorName() {
  new Input({
    message: `What is the Author's Name?`,
    default: config.authorName
  }).run().then(answer => {
    answers['authorName'] = answer
    stepLicense()
  })
}

function stepLicense() {
  new Input({
    message: 'What type of License does this project need?',
    default: config.license
  }).run().then(answer => {
    answers['license'] = answer
    stepBugsURL()
  })
}

function stepBugsURL() {
  new Input({
    message: 'What is the URL to submit bugs?',
    default: config.bugsURL
  }).run().then(answer => {
    answers['bugsURL'] = answer
    stepHomepageURL()
  })
}

function stepHomepageURL() {
  new Input({
    message: 'What is the Home Page URL?',
    default: config.homepageURL
  }).run().then(answer => {
    answers['homepageURL'] = answer
    stepGo()
  })
}

function stepGo() {

  displayDefaults()

  if (answers['template'] == null) {
    if (!fs.existsSync(answers['templateFolderName'])) {
      answers['template'] = 'folder'
      console.log('Error, Template folder does not exist - ' + answers['templateFolderName'])
      return
    }
  }

  if (cmdLine.auto == true) {
    stepCreate()
    return
  }

  var message
  if (cmdLine.defaults == true) {
    message = 'Generate the Ext JS npm project?'
    displayDefaults()
  }
  else {
    message = 'Would you like to generate the Ext JS npm project with above config now?'
  }

  new Confirm({
    message: message,
    default: config.createNow
  }).run().then(answer => {
    answers['createNow'] = answer
    if (answers['createNow'] == true) {
      stepCreate()
    }
    else {
      console.log(`\n${boldRed('Create has been cancelled')}\n`)
      return
    }
  })
}

async function stepCreate() {

  if (answers['template'].includes("universal")) {
    answers['universal'] = true
  }

  var nodeDir = path.resolve(__dirname)
  var currDir = process.cwd()
  var destDir = currDir + '/' + answers['packageName']

  if (fs.existsSync(destDir)){
    console.log(`${boldRed('Error: folder ' + destDir + ' exists')}`)
    //fs.removeSync(destDir) //danger!  if you want to enable this, warn the user
    return
  }
  fs.mkdirSync(destDir)
  process.chdir(destDir)
  console.log(`${app} ${destDir} created`)
  var values = {
    npmScope: npmScope,
    classic: answers['classic'],
    modern: answers['modern'],
    universal: answers['universal'],
    classicTheme: answers['classicTheme'],
    modernTheme: answers['modernTheme'],
    appName: answers['appName'],
    packageName: answers['packageName'],
    version: answers['version'],
    repositoryURL: answers['repositoryURL'],
    keywords: answers['keywords'],
    authorName: answers['authorName'],
    license: answers['license'],
    bugsURL: answers['bugsURL'],
    homepageURL: answers['homepageURL'],
    description: answers['description'],
  }
  var file = nodeDir + '/templates/package.json.tpl.default'
  var content = fs.readFileSync(file).toString()
  var tpl = new Ext.XTemplate(content)
  var t = tpl.apply(values)
  tpl = null
  fs.writeFileSync(destDir + '/package.json', t);
  console.log(`${app} package.json created for ${answers['packageName']}`)

  var file = nodeDir + '/templates/webpack.config.js.tpl.default'
  var content = fs.readFileSync(file).toString()
  var tpl = new Ext.XTemplate(content)
  var t = tpl.apply(values)
  tpl = null
  fs.writeFileSync(destDir + '/webpack.config.js', t);
  console.log(`${app} webpack.config.js created for ${answers['packageName']}`)
  try {
    const substrings = ['[ERR]', '[WRN]', '[INF] Processing', "[INF] Server", "[INF] Writing content", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
    var command = `npm${/^win/.test(require('os').platform()) ? ".cmd" : ""}`
    var args = []
    if (process.env.EXTGEN_VERBOSE == 'true') {
      args = ['install']
    }
    else {
      if (require('os').platform() == 'win32') {
        //args = ['install','-s','>','NUL']
        args = ['install','-s']
      }
      else {
        //args = ['install','-s','>','/dev/null']
        args = ['install','-s']
      }
    }
    let options = {stdio: 'inherit', encoding: 'utf-8'}
    console.log(`${app} npm ${args.toString().replace(/,/g, " ")} started for ${answers['packageName']}`)
    await util.spawnPromise(command, args, options, substrings);
    console.log(`${app} npm ${args.toString().replace(/,/g, " ")} completed for ${answers['packageName']}`)
  } catch(err) {
    console.log(boldRed('Error in npm install: ' + err));
  }

  var frameworkPath = path.join(destDir, 'node_modules', npmScope, 'ext', 'package.json');
  var cmdPath = path.join(destDir, 'node_modules', npmScope, 'cmd', 'package.json');
  var frameworkPkg = require(frameworkPath);
  var cmdPkg = require(cmdPath);
  var cmdVersion = cmdPkg.version_full
  var frameworkVersion = frameworkPkg.sencha.version

  var generateApp = require(`${npmScope}/ext-build-generate-app/generateApp.js`)
  var options = {
    parms: [ 'generate', 'app', answers['appName'], './' ],
    sdk: `node_modules/${npmScope}/ext`,
    template: answers['template'],
    classicTheme: answers['classicTheme'],
    modernTheme: answers['modernTheme'],
    templateFull: answers['templateFolderName'],
    cmdVersion: cmdVersion,
    frameworkVersion: frameworkVersion,
    force: false
  }
  new generateApp(options)
  console.log(`${app} Your Ext JS project is ready`)
  var runPhone = ''
  if (answers['universal'] == true) {
    runPhone = `or "npm run phone"`
  }
  console.log(boldGreen(`\ntype "cd ${answers['packageName']}" then "npm start" to run the development build and open your new application in a web browser or checkout package.json to view additional build scripts.\n`))
 }

 function setDefaults() {
  if (cmdLine.name != undefined) {
    answers['appName'] = cmdLine.name
    answers['packageName'] = kebabCase(answers['appName'])
    answers['description'] = `${answers['packageName']} description for Ext JS app ${answers['appName']}`
  }
  else {
    answers['appName'] = config.appName
    answers['packageName'] = config.packageName
    answers['description'] = config.description
  }
  if (cmdLine.template != undefined) {
    answers['template'] = cmdLine.template
    answers['templateType'] = "make a selection from a list"
  }
  else {
    answers['template'] = config.template
    answers['templateType'] = config.templateType
  }
  if (cmdLine.classictheme != undefined) {
    answers['classicTheme'] = cmdLine.classictheme
  }
  else {
    answers['classicTheme'] = config.classicTheme
  }
  if (cmdLine.moderntheme != undefined) {
    answers['modernTheme'] = cmdLine.moderntheme
  }
  else {
    answers['modernTheme'] = config.modernTheme
  }

  answers['classic'] = false
  answers['modern'] = false
  if (answers['template'].includes("classic")) {
    answers['classic'] = true
  }
  if (answers['template'].includes("modern")) {
    answers['modern'] = true
  }

  answers['universal'] = false
  answers['version'] = config.version
  answers['repositoryURL'] = config.repositoryURL
  answers['keywords'] = processKeywords(config.keywords)
  answers['authorName'] = config.authorName
  answers['license'] = config.license
  answers['bugsURL'] = config.bugsURL
  answers['homepageURL'] = config.homepageURL

  console.dir(answers)
}

function displayDefaults() {
  //console.log(`For controlling ext-gen:`)
  //console.log(`seeDefaults:\t${config.seeDefaults}`)
  //console.log(`useDefaults:\t${config.useDefaults}`)
  //console.log(`createNow:\t${config.createNow}`)
  //console.log(`For template selection:`)
  //console.log(`templateType:\t${config.templateType}`)
  //console.log(`templateFolderName:\t${config.templateFolderName}`)
  //console.log(`classic:\t${answers['classic']}`)
  //console.log(`modern:\t\t${answers['modern']}`)

  console.log(boldGreen(`Defaults for Ext JS app:`))
  console.log(`appName:\t${answers['appName']}`)
  console.log(`template:\t${answers['template']}`)
  if(answers['classic'] == true) {
    console.log(`classicTheme:\t${answers['classicTheme']}`)
  }
  if(answers['modern'] == true) {
    console.log(`modernTheme:\t${answers['modernTheme']}`)
  }
  console.log('')
  console.log(boldGreen(`Defaults for package.json:`))
  console.log(`packageName:\t${answers['packageName']}`)
  console.log(`version:\t${answers['version']}`)
  console.log(`description:\t${answers['description']}`)
  console.log(`repositoryURL:\t${answers['repositoryURL']}`)
  console.log(`keywords:\t${answers['keywords']}`)
  console.log(`authorName:\t${answers['authorName']}`)
  console.log(`license:\t${answers['license']}`)
  console.log(`bugsURL:\t${answers['bugsURL']}`)
  console.log(`homepageURL:\t${answers['homepageURL']}`)
  console.log('')
}

function stepHelpGeneral() {
  stepHelpApp()
}

function stepHelpApp() {
   var classic = ``
  var parms = ``
  if (global.isCommunity) {
    classic = ``
    parms = `ext-gen movetolatest
ext-gen app (-h) (-d) (-i) (-t 'template') (-m 'moderntheme') (-n 'name')

movetolatest       moves an older version ext-gen project to the latest version
-h --help          show help (no parameters also shows help)
-d --defaults      show defaults for package.json
-i --interactive   run in interactive mode (question prompts will display)
-t --template      name for Ext JS template used for generate
-m --moderntheme   theme name for Ext JS modern toolkit
-n --name          name for Ext JS generated app
-v --verbose       verbose npm messages (for problems only)`
  }
  else {
    classic = `${boldGreen('Classic Templates:')}

    ${boldGreen('classicdesktop (default)')}
    This template contains 1 profile, configured to use the classic toolkit of Ext JS for a desktop application

    ${boldGreen('universalclassicmodern')}
    This template contains 2 profiles, 1 for desktop (using the classic toolkit), and 1 for mobile (using the modern toolkit)

    ${boldGreen('classic themes:')} theme-classic, theme-material, theme-neptune, theme-neptune-touch, theme-crisp, theme-crisp-touch  theme-triton, theme-graphite, theme-material\n`

    parms = `ext-gen app (-h) (-d) (-i) (-t 'template') (-m 'moderntheme') (-c 'classictheme') (-n 'name') (-f 'folder')

    -h --help          show help (no parameters also shows help)
    -d --defaults      show defaults for package.json
    -i --interactive   run in interactive mode (question prompts will display)
    -t --template      name for Ext JS template used for generate
    -c --classictheme  theme name for Ext JS classic toolkit (not in Community Edition)
    -m --moderntheme   theme name for Ext JS modern toolkit
    -n --name          name for Ext JS generated app
    -f --folder        folder name for Ext JS application (not implemented yet)
    -v --verbose       verbose npm messages (for problems only)`
  }

  var message = `${boldGreen('Quick Start:')} ext-gen -a

${parms}

${boldGreen('Examples:')}
ext-gen app --template universalmodern --moderntheme theme-material --name CoolUniversalApp
ext-gen app --interactive
ext-gen app -a -t moderndesktop -n ModernApp
${classic}

You can select from the following Ext JS templates provided by Sencha ExtGen

${boldGreen('Modern Templates:')}

${boldGreen('moderndesktop')}
This template contains 1 profile, configured to use the modern toolkit of Ext JS for a desktop application

${boldGreen('universalmodern')}
This template contains 2 profiles, 1 for desktop and 1 for mobile. Both profiles use the modern toolkit.

${boldGreen('modern themes:')}  theme-material, theme-ios, theme-neptune, theme-triton

${classic}
`
  console.log(message)
}

function stepShortHelp() {
  var classic = ``
  if (global.isCommunity) {
    classic = ``
  }
  else {
    classic = `ext-gen app --template classicdesktop --classictheme theme-material --name CoolClassicDesktopApp\n`
  }

  var message = `${boldGreen('Quick Start:')}
ext-gen app MyAppName
ext-gen app -i

${boldGreen('Examples:')}
ext-gen app --template universalmodern --moderntheme theme-material --name CoolUniversalApp
ext-gen app --interactive
ext-gen app -a -t moderndesktop -n ModernApp
${classic}
Run ${boldGreen('ext-gen --help')} to see all options
`
  console.log(message)
}

function processKeywords(answer) {
  var theKeywords = "";
    var keywordArray = answer.split(" ");
     for (var i = 0; i < keywordArray.length; i++) {
        theKeywords += '"' + keywordArray[i] + '",'
    }
    return theKeywords.slice(0, -1);
}
