const json = require('comment-json');
const fs = require('fs-extra');
const toSemVer = require('tosemver');
const path = require('path');
const os = require('os')
const npmScope = '@sencha';

var workspaceDir = '';
var packageFolder = 'packages';
var generatedFilesFolder = 'generatedFiles';
var backupFolder = 'backup';
var backupextension = '.original';
var nodeDirectory = path.resolve(__dirname);
var classicProfile = "classic";
var modernProfile = "modern";
var appJson = 'app.json';
var packageJson = 'package.json';
var workspaceJson = 'workspace.json';
var webpackConfig = 'webpack.config.js';
var gitIgnore = '.gitIgnore';
var gitIgnoreAppend = '/generatedFiles ' + os.EOL + '/cordova ' + os.EOL + '/node_modules' + os.EOL;
var gitIgnoreData = '/build ' + os.EOL + gitIgnoreAppend;
var extFrameworkPath = 'node_modules/@sencha/ext';
var classic = false;
var modern = false;
var universal = false;
var classicTheme;
var modernTheme;
var values;
var appJsonObject;

exports.movetolatestfunction = function movetolatestfunction() {
  if (doesFileExist(workspaceJson)) {
    // could be parent directory of a workspace
    workspaceDir = process.cwd();
    if (doesFileExist(appJson)) {
      moveFromSingleAppWorkspace();
    } else {
      //console.log('upgrading multi-application workspaces is not yet supported')
      console.log('moving from non Ext JS application or multi-application workspace is not yet supported')
      return
      moveFromMultiAppWorkspace();
    }
  } else {
    console.log("Missing workspace.json");
  } 
}



//sencha -sdk ~/aaExt/ext-6.6.0 generate app -r universalApp01 universalApp01
//sencha -sdk ~/aaExt/ext-6.6.0 generate app -modern -r appCmd ./appCMD
//sencha generate workspace ws
//cd ws
//sencha -sdk ~/aaExt/ext-6.6.0 generate app -r wsApp01 wsApp01
//sencha -sdk ~/aaExt/ext-6.6.0 generate app -r wsApp02 wsApp02

function zzzprocessApp(appJsonPath) {
  appJsonObject = getJson(appJsonPath)
  if (appJsonObject.hasOwnProperty('name')) {
    if (allResults.multiApp == false) {
      allResults.name = appJsonObject.name
    }
    var name = appJsonObject.name
    var o = {}
    o.name = name
    o.folder = '/'
    ToolKitAndTheme(appJsonObject, o)
    allApps.push(o)
  }
  else {
    console.log('error')
  }
}

function ToolKitAndTheme(appJsonObject, o) {
  o.classic = false
  o.modern = false
	if (appJsonObject.hasOwnProperty('toolkit')) {
		if (appJsonObject.toolkit == classicProfile) {
      o.classic = true
			o.classicTheme = appJsonObject.theme
		}
		else {
			o.modern = true;
			o.modernTheme = appJsonObject.theme
    }
    o.universal = false
	}
	else {
    if (appJsonObject.builds.length == 1) {
      o.universal = false
    }
    else {
      o.universal = true
    }
		for (profile in appJsonObject.builds) {
			if (profile === classicProfile) {
				o.classic = true;
				o.classicTheme = appJsonObject.builds[profile].theme;
			}
			if (profile == modernProfile) {
				o.modern = true;
				o.modernTheme = appJsonObject.builds[profile].theme;
			}
		}
	}
}

var allApps = []
var allResults = {
  name : '',
  multiApp: false,
  universal: false,
  classic: false,
  modern: false,
  modernThemes: [],
  classicThemes: []
}



// exports.upgradeApp = function upgradeApp() {

//   var workspaceJsonObject = json.parse(fs.readFileSync(workspaceJson).toString())
//   if (workspaceJsonObject.hasOwnProperty('apps')) {
//     console.log('upgrading multi-application workspaces is not yet supported')
//     return
//     if (workspaceJsonObject.apps.length > 0) {
//       var cwd = process.cwd()
//       var lastslashindex = cwd.lastIndexOf('/')
//       var folderName = cwd.substring(lastslashindex  + 1)
//       allResults.name = folderName
//       workspaceJsonObject.apps.forEach(function(name) {
//         allResults.multiApp = true
//         processApp(name + '/' + appJson)
//       })
//     }
//     else {
//       processApp(appJson)
//     }
//   }
//   else {
//     processApp(appJson)
//   }
//   console.log('allApps')
//   console.log(allApps)

//   allApps.forEach(function(app) {
//     if (app.classic == true) {
//       allResults.classic = true
//       if (!allResults.classicThemes.includes(app.classicTheme)) {
//         allResults.classicThemes.push(app.classicTheme)
//       }
//     }
//     if (app.modern == true) {
//       allResults.modern = true
//       if (!allResults.modernThemes.includes(app.modernTheme)) {
//         allResults.modernThemes.push(app.modernTheme)
//       }
//     }
//   })
//   console.log('allResults')
//   console.log(allResults)

//   // if (allResults.classic == true && allResults.modern == true) {
//   //   allResults.universal = true
//   // }
// 	// values = {
//   //   universal: allResults.universal,
// 	// 	npmScope: npmScope,
// 	// 	classic: allResults.classic,
// 	// 	modern: allResults.modern,
// 	// 	classicTheme: classicTheme,
// 	// 	modernTheme: modernTheme,
// 	// 	appName: appJsonObject.name,
// 	// 	packageName: appJsonObject.name,
// 	// 	version: toSemVer(appJsonObject.version)
// 	// }




//   return




//   createPackageJson()
//   console.log('2')
//   createWebPackConfig()
//   console.log('3')

//   doUpgrade(workspaceJson)
//   console.log('5')


//   //console.log('hi')
//   //console.log(workspaceJson)
//   //console.log(workspaceJsonObject)
//   console.log(workspaceJsonObject.hasOwnProperty('apps'))
  
//   if (workspaceJsonObject.hasOwnProperty('apps')) {
// //    console.log('workspaceJsonObject.apps')
// //    console.log(workspaceJsonObject.apps)
//     if (workspaceJsonObject.apps.length > 0) {
//       workspaceJsonObject.apps.forEach(function(app) {
//   //      console.log(app)
//         appJsonObject = getJson(app + '/' + appJson)
//         //console.log(appJsonObject)

//         populateValues()
//         console.log('1')

//         doUpgrade(app + '/' + appJson)
//         console.log('4')

//       })
//     }
//     else {
//     appJsonObject = getJson(appJson)
//     populateValues()
//     console.log('1')
//     doUpgrade(appJson)
//     console.log('4')
//     createEmptyFolders()
//     console.log('6')
//     moveUnncessaryFiles()
//     console.log('7')
//     createGitIgnore()
//     console.log('8')
//     }

//   }
//   else {
//     appJsonObject = getJson(appJson)
//     //return
//     // populateValues()
//     // console.log('1')
//     // createPackageJson()
//     // console.log('2')
//     // createWebPackConfig()
//     // console.log('3')
//     doUpgrade(appJson)
//     console.log('4')

//     createEmptyFolders()
//     console.log('6')
//     moveUnncessaryFiles()
//     console.log('7')
//     createGitIgnore()
//     console.log('8')
//   }
// }


function doesBackupExist(fileName) {
	return doesFileExist(backupFolder + '/' + fileName);
}

function doesFileExist(fileName) {
	return fs.existsSync(fileName);
}

function createFolderIfItDoesnotExist(folderName) {
	if (!fs.existsSync(folderName)) {
		fs.mkdirSync(folderName);
	}
}

function createBackup(fileName) {
	createFolderIfItDoesnotExist(backupFolder);
	copyFile(fileName, backupFolder + '/' + fileName);
}

function restoreBackup(fileName) {
	copyFile(backupFolder + '/' + fileName, fileName);
}

function copyFile(sourceFile, targetFile) {
	fs.copySync(sourceFile, targetFile);
}

function doUpgrade(fileName) {
	if (doesBackupExist(fileName)) {
		console.log("The upgrade is already done. If need to upgrade again Please move files from  " + backupFolder + "/" + fileName +
			" to " + fileName);
		return;
	}
	createBackup(fileName);
	if (!upgradeFile(fileName)) {
		console.log("The upgrade has failed for " + fileName);
		restoreBackup(fileName);
	}
}


function upgradeFile(fileName) {
	switch (fileName) {
		case appJson:
			handleAppJsonUpgrade();
			return true;
		case workspaceJson:
			return handleWorkspaceJsonUpgrade();
		default:
	}
}

function handleAppJsonUpgrade() {
	if (appJsonObject.hasOwnProperty('modern')) {
		removeDebugJsPath(appJsonObject.modern.js);
	}
	if (appJsonObject.hasOwnProperty('classic')) {
		removeDebugJsPath(appJsonObject.classic.js);
	}
	if (appJsonObject.hasOwnProperty('js')) {
		removeDebugJsPath(appJsonObject.js);
	}
	createFileFromJson(appJson, appJsonObject);
}

function removeDebugJsPath(jsonLocation) {
	positionFound = -1;
	for (i in jsonLocation) {
		for (variable in jsonLocation[i]) {
			if (variable == 'path' && jsonLocation[i][variable].indexOf('${framework.dir}') > -1) {
				positionFound = i;
			}
		}
	}
	if (positionFound > -1) {
		jsonLocation.splice(positionFound, 1);
	}
}

function handleWorkspaceJsonUpgrade() {
	var workspaceJsonObject = getJson(workspaceJson);
	workspaceJsonObject.frameworks.ext = extFrameworkPath;
	createFileFromJson(workspaceJson, workspaceJsonObject);
	return true;
}

function createFileFromJson(fileName, jsonObject) {
	fs.writeFile(fileName, json.stringify(jsonObject, null, 2));
}

function getJson(filename) {
	return json.parse(fs.readFileSync(filename).toString());
}




function moveFromSingleAppWorkspace() {
	appJsonObject = getJson(appJson);
	populateValues();
	createPackageJson();
	createWebPackConfig();
	doUpgrade(appJson);
	doUpgrade(workspaceJson);
	createEmptyFolders();
	moveUnncessaryFiles();
	createGitIgnore();
}


function moveFromMultiAppWorkspace() {
	workspaceJsonObject = getJson(workspaceJson);
	appNames = workspaceJsonObject.apps;
	console.log("Upgrading multi app workspace " + workspaceDir);
	console.log(appNames);
	for (appName in appNames) {
		// changing directory to the app directory within workspace and running upgrade
		// inside the context of the app directory
		process.chdir(path.join(workspaceDir, appNames[appName]));
		console.log("Upgrading app " + appNames[appName]);
		//console.log(process.cwd());
		appJsonObject = getJson(appJson);
		populateValues();
		createPackageJson();
		createWebPackConfig();
		doUpgrade(appJson);
		createEmptyFolders();
		moveUnncessaryFiles();
		createGitIgnore();
		console.log("Upgraded app " + appNames[appName] + " successfully");
	}
	// switching back to workspace directory
	process.chdir(workspaceDir);
	// is this needed?
	doUpgrade(workspaceJson);
}

function createGitIgnore() {
	if (doesBackupExist(gitIgnore)) {
		console.log("The upgrade is already done. If need to upgrade again Please move files from  " + backupFolder + "/" + gitIgnore +
			" to " + gitIgnore);
		return;
	}
	if (doesFileExist(gitIgnore)) {
		createBackup(gitIgnore);
		fs.appendFileSync(gitIgnore, gitIgnoreAppend);
	}
	else {
		fs.writeFile(gitIgnore, gitIgnoreData);
	}
}

function createEmptyFolders() {
	createFolderIfItDoesnotExist(generatedFilesFolder);
	createFolderIfItDoesnotExist(packageFolder);
}

function moveUnncessaryFiles() {
	moveFileIfExist('classic.json');
	moveFileIfExist('classic.jsonp');
	moveFileIfExist('modern.json');
	moveFileIfExist('modern.jsonp');
	moveFileIfExist('bootstrap.js');
	moveFileIfExist('bootstrap.css');
}

function moveFileIfExist(fileName) {
	if (doesFileExist(fileName)) {
		fs.rename(fileName, backupFolder + '/' + fileName);
	}
}

function createPackageJson() {
	if (doesFileExist(packageJson)) {
		console.log(packageJson + ' already exists so skipping this step');
		return;
	}
	var file = nodeDirectory + '/templates/' + packageJson + '.tpl.default';
	var content = fs.readFileSync(file).toString();
	var tpl = new Ext.XTemplate(content);
	var t = tpl.apply(values);
	tpl = null;
	fs.writeFileSync('package.json', t);
}

function createWebPackConfig() {
	if (doesFileExist(webpackConfig)) {
		console.log(webpackConfig + ' already exists so skipping this step');
		return;
	}
	var file = nodeDirectory + '/templates/webpack.config.js.tpl.default';
	var content = fs.readFileSync(file).toString();
	var tpl = new Ext.XTemplate(content);
	var t = tpl.apply(values);
	tpl = null;
	fs.writeFileSync(webpackConfig, t);
}

function populateValues() {
	//var data = fs.readFileSync(nodeDirectory + '/config.json');
	//var config = JSON.parse(data);
	buildToolKitAndThemeDetails();
	values = {
    universal: universal,
		npmScope: npmScope,
		classic: classic,
		modern: modern,
		classicTheme: classicTheme,
		modernTheme: modernTheme,
		appName: appJsonObject.name,
		packageName: appJsonObject.name,
		version: toSemVer(appJsonObject.version)
	}
}

function buildToolKitAndThemeDetails() {
	if (appJsonObject.hasOwnProperty('toolkit')) {
		if (appJsonObject.toolkit == classicProfile) {
			classic = true;
			classicTheme = appJsonObject.theme;
		}
		else {
			modern = true;
			modernTheme = appJsonObject.theme;
		}
	}
	else {
    if (appJsonObject.builds.length == 1) {
      universal = false
    }
    else {
      universal = true
    }
    console.log('universal')
    console.log(universal)
		for (profile in appJsonObject.builds) {
			if (profile === classicProfile) {
				classic = true;
				classicTheme = appJsonObject.builds[profile].theme;
			}
			if (profile == modernProfile) {
				modern = true;
				modernTheme = appJsonObject.builds[profile].theme;
			}
		}
	}
}
