var fs = require('fs-extra')
var _ = require('underscore')
var chalk = require('chalk');
var path = require('path')
var util = require('../util.js')
const help = require('../help.js')

require('../XTemplate/js/Ext.js');
require('../XTemplate/js/String.js');
require('../XTemplate/js/Format.js');
require('../XTemplate/js/Template.js');
require('../XTemplate/js/XTemplateParser.js');
require('../XTemplate/js/XTemplateCompiler.js');
require('../XTemplate/js/XTemplate.js');

try {

	exports.init = function init(CurrWorkingDir, pathSenchaCmd, options, NodeAppTemplatesDir) { 
		var parms = options.parms
		if(parms[5] != undefined) {throw util.err('Only 3 parameters are allowed')}
		var ApplicationName = parms[2];util.dbgLog('ApplicationName: ' + ApplicationName)
		var ApplicationDir = parms[3];util.dbgLog('ApplicationDir: ' + ApplicationDir)
		var Template = options.template;util.dbgLog('Template: ' + Template)
		var Builds = options.builds;util.dbgLog('Builds: ' + Builds)
		var Sdk = path.join(options.sdk);util.dbgLog('Sdk: ' + Sdk)
		
		var Force = options.force;util.dbgLog('Force: ' + Force)
		if(Template == undefined) {throw '--template parameter is required'}
		if(Sdk == undefined) {throw '--sdk parameter is required'}
		if(ApplicationName == undefined) {throw 'Application Name parameter is empty'}
		if(ApplicationDir == undefined) {throw 'Application Directory parameter is empty'}
		if (!fs.existsSync(Sdk)){throw Sdk + ' sdk folder does not exist'}
		var NodeAppApplicationTemplatesDir = path.join(NodeAppTemplatesDir + '/Application');util.dbgLog('NodeAppApplicationTemplatesDir: ' + NodeAppApplicationTemplatesDir)
		var TemplateDir = path.join(NodeAppApplicationTemplatesDir + '/' + Template);util.dbgLog('TemplateDir: ' + TemplateDir)
		if (!fs.existsSync(TemplateDir)){throw 'Template ' + Template + ' does not exist'}
		if (Force) {
			try {
				fs.removeSync(ApplicationDir)
				util.infLog(ApplicationDir + ' deleted (--force is set)')
			} catch(e) {
				if (e.code == 'EEXIST') throw e;
			}
		}

		if(ApplicationDir != './') {fs.mkdirSync(ApplicationDir);util.infLog(ApplicationDir + ' created')}
		walkSync(TemplateDir, TemplateDir.length+1, ApplicationDir, ApplicationName, Template)
		f='/.sencha';fs.copySync(NodeAppApplicationTemplatesDir  + f, ApplicationDir + f);util.dbgLog(ApplicationDir + f+' created')
		util.infLog('Completed app creation from the ' + Template + ' template')
		
		util.infLog('Copying the framework from ' + Sdk)
		var eDir = ApplicationDir + '/ext';fs.mkdirSync(eDir)

		f='/index.js';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
		f='/license.txt';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
		f='/package.json';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')

		f='/cmd';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
		f='/sass';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')

    var n = Sdk.indexOf("@extjs");
if (n == -1) {

//		f='/build.xml';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
//		f='/ext-bootstrap.js';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
//		f='/version.properties';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
//		f='/.sencha';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
//		f='/classic';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
    
//		f='/licenses';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
//		f='/modern';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
//		f='/packages';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')

		// var fromBuild = Sdk + '/build'
		// var toBuild = eDir + '/build'
		// fs.mkdirSync(toBuild);util.dbgLog(toBuild+' created')
		// fs.readdir(fromBuild, function(err, filenames) {
		// 	filenames.forEach(function(filename) {
		// 		if (filename.substr(filename.length - 3) == '.js') {
		// 			util.dbgLog(toBuild + '/' + filename + ' created')
		// 			fs.copySync(fromBuild + '/' + filename, toBuild + '/' + filename)
		// 		}
		// 	});
		// 	util.infLog('Copying the framework is completed')
		// 	util.infLog(chalk.green(`The application '${ApplicationName}' is ready in the '${ApplicationDir}' folder!`))

		// 	var viewpackage = chalk.yellow(`cd ${ApplicationDir}/desktop/app/view; sn gen vp settings; cd ../../../`)
		// 	var watch = chalk.yellow(`cd ${ApplicationDir}; sencha app watch -port 1841 moderndesktop`)
		// 	console.log(help.finishText(ApplicationDir, viewpackage, watch))
    // });
}
    
	}

	// List all files in a directory in Node.js recursively in a synchronous fashion
	//https://gist.github.com/kethinov/6658166
	//const walkSync = (d) => fs.statSync(d).isDirectory() ? fs.readdirSync(d).map(f => walkSync(path.join(d, f)+'\n')) : d;
	var walkSync = function(dir, len, ApplicationDir, ApplicationName, Template) {
		var path = path || require('path');
		var fs = fs || require('fs');
		var files = fs.readdirSync(dir);
		files.forEach(function(file) {
			if (fs.statSync(path.join(dir, file)).isDirectory()) {
				util.dbgLog('file (directory): ' + file)
				var all = path.join(dir, file);util.dbgLog('all: ' + all)
				var small = all.slice(len)
				fs.mkdirSync(ApplicationDir + '/' + small);
				walkSync(path.join(dir, file), len, ApplicationDir, ApplicationName, Template);
			}
			else {
				util.dbgLog('file (file): ' + file)
				if (file.substr(file.length - 7) != 'default') { return }
				var i = 'People';//mjg
				iSmall = i.toLowerCase()
				var iCaps = iSmall[0].toUpperCase() + iSmall.substring(1)
				var viewFileName = iCaps + 'View'
				var viewNameSmall = iSmall + 'view'
				const uuidv4 = require('uuid/v4');
				var values = {
					universal: true,
					toolkit: 'modern',
					template: Template,
					frameworkIsV62: true,
					frameworkIsV65: true,
					fwIs60: false,
					themeName: 'default',
					classicTheme: "theme-triton",
					modernTheme: "theme-material",
					appName: ApplicationName,
					name: ApplicationName,
					frameworkKey: 'ext',
					uniqueId: uuidv4(),
					modernTheme: "theme-material",
					viewFileName : viewFileName,
					viewName: iSmall + '.' + viewFileName,
					viewNamespaceName: ApplicationName + '.' + 'view.' + iSmall + '.' + viewFileName,
					viewBaseClass: "Ext.panel.Panel",
					viewNameSmall: viewNameSmall
				}
				var all = path.join(dir, file);util.dbgLog('all: ' + all)
				var content = fs.readFileSync(all).toString()
				if (file.substr(file.length - 11) == 'tpl.default') { 
					var tpl = new Ext.XTemplate(content)
					var t = tpl.apply(values)
					delete tpl
					var small = all.slice(len)
					var filename = small.substr(0, small.length - (11+1))
					fs.writeFileSync(ApplicationDir + '/' + filename, t);
				}
				else {
					var small = all.slice(len)
					var filename = small.substr(0, small.length - (7+1))
					var theNonTplPath = ApplicationDir + '/' + filename;util.dbgLog('theNonTplPath: ' + theNonTplPath)
					fs.createReadStream(all).pipe(fs.createWriteStream(theNonTplPath));
				}
			}
		});
	};
}
catch(e) {
	console.log(e)
}




		
		// var ncp = require('ncp').ncp;
		// ncp.limit = 16;
		// ncp(path.join(dotSenchaDir), ApplicationDir + '/.sencha', function (err) {
		// 	if (err) { return console.error(err); }
		// });


		// var a = {"builds": {
		// 	"desktop": {"toolkit": "modern","theme": "theme-material"},
		// 	"phone": {"toolkit": "modern","theme": "theme-material"}
		// }}

// sn gen app MyApp ./MyApp --template 'enterprise' --builds "desktop:modern,theme-material;phone:modern,theme-material;"
// sencha-node generate app --sdk '/Users/marcgusmano/aaExt/ext-6.5.2' --template 'universalmodern' Honda ./Honda

//		--builds "desktop;phone" --toolkit "modern" --theme "theme-material" 
//		--builds "desktop:modern,theme-material;phone:modern,theme-material;" 
		

	
// includes=".sencha/**/*,
// sass/**/*,
// src/**/*,
// classic/**/*,
// modern/**/*,
// overrides/**/*,
// resources/**/*,
// build/*.js,
// cmd/**/*,
// locale/**/*,
// *.js,
// *.json,
// build.xml,
// license.txt,
// licenses/**/*,
// version.properties,
// packages/**/*"/>



// function extCopy(f) {
// 	fs.mkdirSync(eDir+'/'+f);
// 	ncp(s+'/'+f,eDir+'/'+f, function (err) {
// 		if (err)
// 			{util.errLog(err)};
// 		util.infLog('/ext/'+f+' created')
// 	})
// }





// var f='build.xml';fs.copySync(s+'/'+f,eDir+'/'+f);util.infLog('/ext/'+f+' created')
// var f='license.txt';fs.copySync(s+'/'+f,eDir+'/'+f);util.infLog('/ext/'+f+' created')
// var f='version.properties';fs.copySync(s+'/'+f,eDir+'/'+f);util.infLog('/ext/'+f+' created')
// extCopy('build')
// extCopy('.sencha')
// extCopy('classic')
// extCopy('cmd')
// extCopy('licenses')
// extCopy('modern')
// extCopy('packages')
// extCopy('sass')

// var eDir = ApplicationDir + '/ext/build';fs.mkdirSync(eDir)
// // var eDir = ApplicationDir + '/ext/build';fs.mkdirSync(eDir);fs.copySync(s + '/build', eDir)
// var eDir = ApplicationDir + '/ext/build/classic';fs.mkdirSync(eDir);fs.copySync(s + '/build/classic', eDir)
// var eDir = ApplicationDir + '/ext/build/modern';fs.mkdirSync(eDir);fs.copySync(s + '/build/modern', eDir)
// // var eDir = ApplicationDir + '/ext/build/packages';fs.mkdirSync(eDir);fs.copySync(s + '/build/packages', eDir)
// // var eDir = ApplicationDir + '/ext/build/resources';fs.mkdirSync(eDir);fs.copySync(s + '/build/resources', eDir)









// {var b='.sencha';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var c='build';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var d='classic';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var e='cmd';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var f='licenses';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var g='modern';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var h='packages';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}
// {var i='sass';fs.mkdirSync(eDir+'/'+f);ncp(s+'/'+f,eDir+'/'+f, function (err) {if (err){util.errLog(err)};util.infLog('/ext/'+f+' done')})}j

