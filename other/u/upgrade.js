require('./XTemplate/js')
const json = require('comment-json')
const fs = require('fs-extra')
const toSemVer = require('tosemver')
const path = require('path')
const os = require('os')

var backupFolder = 'backup'
var values = {
  appName: '',
  universal: false,
  classic: false,
  classicTheme: false,
  modern: false,
  modernTheme: false,
  npmScope: '@sencha',
  packageName: '',
  version: '0.0.0'
}

var appJsonObject

class Upgrade {

  upgradeApp() {
    var workspaceDir = ''
    if (this.doesFileExist('workspace.json')) {
      if (this.areFrameworksSupported() == false) {return}
      workspaceDir = process.cwd()
      console.log(workspaceDir)
      if (this.doesFileExist('app.json')) {
        this.upgradeSingleAppWorkspace(workspaceDir)
      } 
      else {
        this.upgradeMultiAppWorkspace(workspaceDir)
      }
    } 
    else {
      console.log("Folder is not an Ext JS application, missing workspace.json")
      return
    } 
  }

  areFrameworksSupported() {
    var workspaceJsonObject = this.getJson('workspace.json')
    var frameworks = workspaceJsonObject.frameworks
    for (var framework in frameworks) {
      var version = frameworks[framework].version
      if (version == undefined) {
        console.log(`No framework version defined in workspace.json`)
        return false 
      }
      var majorminor = version.substring(0, 3)
      var supportedVersions = ['6.6', '6.7', '7.0']
      if (!supportedVersions.includes(majorminor) ) {
        console.log(`framework ${version} not supported, versions supported: ${supportedVersions}`)
        return false
      }
    }
    return true
  }

  upgradeSingleAppWorkspace(workspaceDir) {
    console.log("Upgrading single app workspace " + workspaceDir)
    appJsonObject = this.getJson('app.json')
    this.populateValues()
    this.createEmptyFolders()
    this.moveUnncessaryFiles()
    this.createGitIgnore()
    this.createPackageJson()
    this.createWebPackConfig()
    this.doUpgrade('app.json')
    this.doUpgrade('workspace.json')

  }

  upgradeMultiAppWorkspace(workspaceDir) {
    var workspaceJsonObject = this.getJson('workspace.json')
    var appNames = workspaceJsonObject.apps
    if (appNames == undefined) {
      console.log('Workspace has no applications to upgrade')
      return
    }
    console.log("Upgrading multi app workspace: " + workspaceDir)
    for (var appName in appNames) {
      process.chdir(path.join(workspaceDir, appNames[appName]))
      //console.log("Upgrading app " + appNames[appName])
      appJsonObject = this.getJson('app.json')
      this.populateValues()
      //this.createPackageJson()
      //this.createWebPackConfig()
      this.doUpgrade('app.json')
      this.createEmptyFolders()
      this.moveUnncessaryFiles()
      this.createGitIgnore()
      console.log("Upgraded app " + appNames[appName] + " successfully")
    }
    process.chdir(workspaceDir)
    this.createPackageJson()
    console.log('2')
    this.createWebPackConfig()
    this.doUpgrade('workspace.json')
  }

  populateValues() {
    // const npmScope = '@sencha'
    // var classic = false
    // var modern = false
    // var universal = false
    // var classicTheme
    // var modernTheme


    //this.buildToolKitAndThemeDetails()
    if (appJsonObject.hasOwnProperty('toolkit')) {
      if (appJsonObject.toolkit ==  'classic' ) {
        values.classic = true
        values.classicTheme = appJsonObject.theme
      }
      else {
        values.modern = true
        values.modernTheme = appJsonObject.theme
      }
    }
    else {
      if (appJsonObject.builds.length == 1) {
        values.universal = false
      }
      else {
        values.universal = true
      }
      for (profile in appJsonObject.builds) {
        if (profile ===  'classic' ) {
          values.classic = true
          values.classicTheme = appJsonObject.builds[profile].theme
        }
        if (profile ==  'modern' ) {
          values.modern = true
          values.modernTheme = appJsonObject.builds[profile].theme
        }
      }
    }
    // values = {
    //   appName: appJsonObject.name,
    //   universal: universal,
    //   classic: classic,
    //   classicTheme: classicTheme,
    //   modern: modern,
    //   modernTheme: modernTheme,
    //   npmScope: npmScope,
    //   packageName: appJsonObject.name,
    //   version: toSemVer(appJsonObject.version)
    // }
  }

  createPackageJson() {
    var packageJson = 'package.json'
    if (this.doesFileExist(packageJson)) {
      console.log(packageJson + ' already exists so skipping this step')
      return
    }
    var nodeDirectory = path.resolve(__dirname)
    var file = nodeDirectory + '/templates/' + packageJson + '.tpl.default'
    var content = fs.readFileSync(file).toString()
    var tpl = new Ext.XTemplate(content)
    var t = tpl.apply(values)
    tpl = null
    fs.writeFileSync(packageJson, t)
  }

  createWebPackConfig() {
    var webpackConfig = 'webpack.config.js'
    if (this.doesFileExist(webpackConfig)) {
      console.log(webpackConfig + ' already exists so skipping this step')
      return
    }
    var nodeDirectory = path.resolve(__dirname)
    var file = nodeDirectory + '/templates/' + webpackConfig + '.tpl.default'
    var content = fs.readFileSync(file).toString()
    var tpl = new Ext.XTemplate(content)
    var t = tpl.apply(values)
    tpl = null
    fs.writeFileSync(webpackConfig, t)
  }

  doUpgrade(fileName) {
    if (this.doesBackupExist(fileName)) {
      console.log("The upgrade is already done. If need to upgrade again Please move files from  " + backupFolder + "/" + fileName + " to " + fileName)
      return
    }
    this.createBackup(fileName)
    if (!this.upgradeFile(fileName)) {
      console.log("The upgrade has failed for " + fileName)
      this.restoreBackup(fileName)
    }
  }

  doesBackupExist(fileName) {
    return this.doesFileExist(backupFolder + '/' + fileName)
  }

  createBackup(fileName) {
    this.createFolderIfItDoesnotExist(backupFolder);
    this.copyFile(fileName, backupFolder + '/' + fileName)
  }
  
  upgradeFile(fileName) {
    switch (fileName) {
      case 'app.json':
        return this.handleAppJsonUpgrade()
      case 'workspace.json':
        return this.handleWorkspaceJsonUpgrade()
      default:
    }
  }

  restoreBackup(fileName) {
    this.copyFile(backupFolder + '/' + fileName, fileName)
  }

  handleAppJsonUpgrade() {
    if (appJsonObject.hasOwnProperty('modern')) {
      this.removeDebugJsPath(appJsonObject.modern.js)
    }
    if (appJsonObject.hasOwnProperty('classic')) {
      this.removeDebugJsPath(appJsonObject.classic.js)
    }
    if (appJsonObject.hasOwnProperty('js')) {
      this.removeDebugJsPath(appJsonObject.js)
    }
    this.createFileFromJson('app.json', appJsonObject)
    return true
  }

  removeDebugJsPath(jsonLocation) {
    var positionFound = -1;
    for (var i in jsonLocation) {
      for (var variable in jsonLocation[i]) {
        if (variable == 'path' && jsonLocation[i][variable].indexOf('${framework.dir}') > -1) {
          positionFound = i;
        }
      }
    }
    if (positionFound > -1) {
      jsonLocation.splice(positionFound, 1);
    }
  }

  handleWorkspaceJsonUpgrade() {
    var workspaceJsonObject = this.getJson('workspace.json')
    workspaceJsonObject.frameworks.ext.path = 'node_modules/@sencha/ext'
    //workspaceJsonObject.frameworks.ext.version = '6.7.0.0'  //needs to be looked up

    //workspaceJsonObject.packages.dir.push("node_modules/@sencha")

    var dir = workspaceJsonObject.packages.dir
    console.log(dir)
    var dirType = typeof dir
    console.log(dirType)
    if(typeof dir == "string") {
      workspaceJsonObject.packages.dir = []
      workspaceJsonObject.packages.dir.push(dir)
      workspaceJsonObject.packages.dir.push("node_modules/@sencha")
    }
    else {
      workspaceJsonObject.packages.dir.push("node_modules/@sencha")
    }
    this.createFileFromJson('workspace.json', workspaceJsonObject)
    return true
  }
  
  createFileFromJson(fileName, jsonObject) {
    fs.writeFile(fileName, json.stringify(jsonObject, null, 2))
  }
  
  getJson(filename) {
    return json.parse(fs.readFileSync(filename).toString())
  }


 
  doesFileExist(fileName) {
    return fs.existsSync(fileName)
  }
  
  createFolderIfItDoesnotExist(folderName) {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
  }

  copyFile(sourceFile, targetFile) {
    fs.copySync(sourceFile, targetFile)
  }










  createGitIgnore() {
    var gitIgnore = '.gitIgnore'
    var gitIgnoreAppend = '/generatedFiles ' + os.EOL + '/cordova ' + os.EOL + '/node_modules' + os.EOL
    var gitIgnoreData = '/build ' + os.EOL + gitIgnoreAppend

    if (this.doesBackupExist(gitIgnore)) {
      console.log("The upgrade is already done. If need to upgrade again Please move files from  " + backupFolder + "/" + gitIgnore +
        " to " + gitIgnore);
      return;
    }
    if (this.doesFileExist(gitIgnore)) {
      this.createBackup(gitIgnore);
      fs.appendFileSync(gitIgnore, gitIgnoreAppend);
    }
    else {
      fs.writeFile(gitIgnore, gitIgnoreData);
    }
  }
  
  createEmptyFolders() {
    var generatedFilesFolder = 'generatedFiles'
    var packageFolder = 'packages'
    this.createFolderIfItDoesnotExist(generatedFilesFolder)
    this.createFolderIfItDoesnotExist(packageFolder)
  }
  
  moveUnncessaryFiles() {
    this.moveFileIfExist('classic.json');
    this.moveFileIfExist('classic.jsonp');
    this.moveFileIfExist('modern.json');
    this.moveFileIfExist('modern.jsonp');
    this.moveFileIfExist('bootstrap.js');
    this.moveFileIfExist('bootstrap.css');
  }
  
  moveFileIfExist(fileName) {
    if (this.doesFileExist(fileName)) {
      fs.rename(fileName, backupFolder + '/' + fileName);
    }
  }
  

  
   // buildToolKitAndThemeDetails() {
  //   if (appJsonObject.hasOwnProperty('toolkit')) {
  //     if (appJsonObject.toolkit ==  'classic' ) {
  //       classic = true
  //       classicTheme = appJsonObject.theme
  //     }
  //     else {
  //       modern = true
  //       modernTheme = appJsonObject.theme
  //     }
  //   }
  //   else {
  //     if (appJsonObject.builds.length == 1) {
  //       universal = false
  //     }
  //     else {
  //       universal = true
  //     }
  //     for (profile in appJsonObject.builds) {
  //       if (profile ===  'classic' ) {
  //         classic = true
  //         classicTheme = appJsonObject.builds[profile].theme
  //       }
  //       if (profile ==  'modern' ) {
  //         modern = true
  //         modernTheme = appJsonObject.builds[profile].theme
  //       }
  //     }
  //   }
  // }
  

  // ToolKitAndTheme(appJsonObject, o) {
  //   o.classic = false
  //   o.modern = false
  //   if (appJsonObject.hasOwnProperty('toolkit')) {
  //     if (appJsonObject.toolkit ==  'classic' ) {
  //       o.classic = true
  //       o.classicTheme = appJsonObject.theme
  //     }
  //     else {
  //       o.modern = true;
  //       o.modernTheme = appJsonObject.theme
  //     }
  //     o.universal = false
  //   }
  //   else {
  //     if (appJsonObject.builds.length == 1) {
  //       o.universal = false
  //     }
  //     else {
  //       o.universal = true
  //     }
  //     for (profile in appJsonObject.builds) {
  //       if (profile ===  'classic' ) {
  //         o.classic = true;
  //         o.classicTheme = appJsonObject.builds[profile].theme;
  //       }
  //       if (profile ==  'modern' ) {
  //         o.modern = true;
  //         o.modernTheme = appJsonObject.builds[profile].theme;
  //       }
  //     }
  //   }
  // }



//   upgradeApp2() {

//     var workspaceJsonObject = json.parse(fs.readFileSync(workspaceJson).toString())
//     if (workspaceJsonObject.hasOwnProperty('apps')) {
//       console.log('yes')
//       if (workspaceJsonObject.apps.length > 0) {
//         var cwd = process.cwd()
//         var lastslashindex = cwd.lastIndexOf('/')
//         var folderName = cwd.substring(lastslashindex  + 1)
//         allResults.name = folderName
//         workspaceJsonObject.apps.forEach(function(name) {
//           allResults.multiApp = true
//           processApp(name + '/' + appJson)
//         })
//       }
//       else {
//         this.processApp(appJson)
//       }
//     }
//     else {
//       console.log('no')
//       this.processApp(appJson)
//     }
//     console.log('allApps')
//     console.log(allApps)

// //    return
  
//     allApps.forEach(function(app) {
//       if (app.classic == true) {
//         allResults.classic = true
//         if (!allResults.classicThemes.includes(app.classicTheme)) {
//           allResults.classicThemes.push(app.classicTheme)
//         }
//       }
//       if (app.modern == true) {
//         allResults.modern = true
//         if (!allResults.modernThemes.includes(app.modernTheme)) {
//           allResults.modernThemes.push(app.modernTheme)
//         }
//       }
//     })
//     console.log('allResults')
//     console.log(allResults)

//     this.createPackageJson()
//     console.log('2')
//     this.createWebPackConfig()
//     console.log('3')
  
//     this.doUpgrade(workspaceJson)
//     console.log('5')
  
  
//     //console.log('hi')
//     //console.log(workspaceJson)
//     //console.log(workspaceJsonObject)
//     console.log(workspaceJsonObject.hasOwnProperty('apps'))
    
//     if (workspaceJsonObject.hasOwnProperty('apps')) {
//   //    console.log('workspaceJsonObject.apps')
//   //    console.log(workspaceJsonObject.apps)
//       if (workspaceJsonObject.apps.length > 0) {
//         workspaceJsonObject.apps.forEach(function(app) {
//     //      console.log(app)
//           appJsonObject = getJson(app + '/' + appJson)
//           //console.log(appJsonObject)
  
//           populateValues()
//           console.log('1')
  
//           doUpgrade(app + '/' + appJson)
//           console.log('4')
  
//         })
//       }
//       else {
//       appJsonObject = getJson(appJson)
//       populateValues()
//       console.log('1')
//       doUpgrade(appJson)
//       console.log('4')
//       createEmptyFolders()
//       console.log('6')
//       moveUnncessaryFiles()
//       console.log('7')
//       createGitIgnore()
//       console.log('8')
//       }
//     }
//   }


  processApp(appJsonPath) {
    console.log('processApp')
    appJsonObject = this.getJson(appJsonPath)
    if (appJsonObject.hasOwnProperty('name')) {
      if (allResults.multiApp == false) {
        allResults.name = appJsonObject.name
      }
      var name = appJsonObject.name
      var o = {}
      o.name = name
      o.folder = '/'
      this.ToolKitAndTheme(appJsonObject, o)
      allApps.push(o)
    }
    else {
      console.log('error')
    }
  }





}
module.exports = Upgrade
//var workspaceJson = 'workspace.json'
//var appJson = 'app.json'
//var backupextension = '.original'
//var  'classic'  = "classic"
//var  'modern'  = "modern"
//var packageJson = 'package.json'
//var webpackConfig = 'webpack.config.js'
// var gitIgnore = '.gitIgnore'
// var gitIgnoreAppend = '/generatedFiles ' + os.EOL + '/cordova ' + os.EOL + '/node_modules' + os.EOL
// var gitIgnoreData = '/build ' + os.EOL + gitIgnoreAppend


// const npmScope = '@sencha'
// var classic = false
// var modern = false
// var universal = false
// var classicTheme
// var modernTheme



// var allApps = []
// var allResults = {
//   name : '',
//   multiApp: false,
//   universal: false,
//   classic: false,
//   modern: false,
//   modernThemes: [],
//   classicThemes: []
// }
