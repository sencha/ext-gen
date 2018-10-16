var fs = require('fs-extra')
var _ = require('underscore')
var chalk = require('chalk');
var path = require('path')
var util = require('../util.js')
const help = require('../help.js')
var debug = false

require('../XTemplate/js/Ext.js');
require('../XTemplate/js/String.js');
require('../XTemplate/js/Format.js');
require('../XTemplate/js/Template.js');
require('../XTemplate/js/XTemplateParser.js');
require('../XTemplate/js/XTemplateCompiler.js');
require('../XTemplate/js/XTemplate.js');

	// List all files in a directory in Node.js recursively in a synchronous fashion
	//https://gist.github.com/kethinov/6658166
	//const walkSync = (d) => fs.statSync(d).isDirectory() ? fs.readdirSync(d).map(f => walkSync(path.join(d, f)+'\n')) : d;
	function walkSync(dir, len, ApplicationDir, ApplicationName, Template, SdkVal, Packages) {
		var path = path || require('path');
		var fs = fs || require('fs');
		var files = fs.readdirSync(dir);
		files.forEach(function(file) {
			if (fs.statSync(path.join(dir, file)).isDirectory()) {
        util.dbgLog('file (directory): ' + file)
				var all = path.join(dir, file);util.dbgLog('all: ' + all)
        var small = all.slice(len)
//        try {
          fs.mkdirSync(ApplicationDir + '/' + small);
        // }
        // catch(e) {
        //   chalk.red('App already exists')
        //   return
        // }
				walkSync(path.join(dir, file), len, ApplicationDir, ApplicationName, Template, SdkVal, Packages);
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
          sdkval: SdkVal,
          packages: Packages,
					uniqueId: uuidv4(),
//					modernTheme: "theme-material",
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
          tpl = null
//					delete tpl
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
	}



class app {
  constructor(options) {
    var CurrWorkingDir = process.cwd()
//    var SenchaCmdDir = util.getSenchaCmdPath()
    var NodeAppBinDir = path.resolve(__dirname)
    var TemplatesDir = '/extjs-templates' 
    var NodeAppTemplatesDir = path.join(NodeAppBinDir + '/..' + TemplatesDir) 
    
    var parms = options.parms
		if(parms[5] != undefined) {throw util.err('Only 3 parameters are allowed')}
		var ApplicationName = parms[2];util.dbgLog('ApplicationName: ' + ApplicationName)
		var ApplicationDir = parms[3];util.dbgLog('ApplicationDir: ' + ApplicationDir)
		var Template = options.template;util.dbgLog('Template: ' + Template)
		var Builds = options.builds;util.dbgLog('Builds: ' + Builds)
		var Sdk = options.sdk;util.dbgLog('Sdk: ' + Sdk)
		
		var Force = options.force;util.dbgLog('Force: ' + Force)
		if(Template == undefined) {throw '--template parameter is required'}
		if(Sdk == undefined) {throw '--sdk parameter is required'}
		if(ApplicationName == undefined) {throw 'Application Name parameter is empty'}
		if(ApplicationDir == undefined) {throw 'Application Directory parameter is empty'}
//		if (!fs.existsSync(Sdk)){throw Sdk + ' sdk folder does not exist'}
		var NodeAppApplicationTemplatesDir = path.join(NodeAppTemplatesDir + '/Application');util.dbgLog('NodeAppApplicationTemplatesDir: ' + NodeAppApplicationTemplatesDir)
		var TemplateDir = path.join(NodeAppApplicationTemplatesDir + '/' + Template);util.dbgLog('TemplateDir: ' + TemplateDir)
    //var TemplateDir = path.join(NodeAppBinDir + '/node_modules/@sencha/apptemplate-' + Template + '/template');util.dbgLog('TemplateDir: ' + TemplateDir)
    //var TemplateDir = o.options.templateFull

    var TemplateDir = ''
    if(Template == 'folder') {
      TemplateDir = options.templateFull
    }
    else {
      TemplateDir = path.join(NodeAppApplicationTemplatesDir + '/' + Template);util.dbgLog('TemplateDir: ' + TemplateDir)
    }
    
    if (!fs.existsSync(TemplateDir)){throw 'Template ' + Template + ' does not exist'}
		if (Force) {
			try {
				fs.removeSync(ApplicationDir)
				util.infLog(ApplicationDir + ' deleted (--force is set)')
			} catch(e) {
				if (e.code == 'EEXIST') throw e;
			}
		}

    if(ApplicationDir != './') {
      fs.mkdirSync(ApplicationDir)

      console.log(`${app} ${ApplicationDir} created`)


      //util.infLog(ApplicationDir + ' created')
    }
    // else {
    //   console.log('Existing directory: ' + ApplicationDir)
    // }

    var SdkVal
    var Packages
    var n = Sdk.indexOf("@sencha");
    if (n == -1) {
      SdkVal = 'ext'
      Packages = '$\u007Bworkspace.dir}/packages'
    }
    else {
      //need this to be a variable - Sdk?
      SdkVal = Sdk
      Packages = '$\u007Bworkspace.dir}/packages,node_modules/@sencha'
		}

		walkSync(TemplateDir, TemplateDir.length+1, ApplicationDir, ApplicationName, Template, SdkVal, Packages)
    var f

    //console.log(NodeAppBinDir)
    //f=NodeAppBinDir + '/../../@sencha/cmd/dist/templates/app/{senchadir}/app'
    //fs.copySync(f, ApplicationDir + '/.sencha');util.dbgLog(ApplicationDir + '/.sencha' + ' created')
    f='/.sencha';fs.copySync(NodeAppApplicationTemplatesDir  + '/sencha', ApplicationDir + f);util.dbgLog(ApplicationDir + f+' created')



    var cmdVersion = options.cmdVersion
    var frameworkVersion = options.frameworkVersion

    var senchaCfg = path.join(ApplicationDir, '.sencha', 'app', 'sencha.cfg');
    fs.readFile(senchaCfg, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace('{cmdVer}', cmdVersion)
                        .replace('{frameVer}', frameworkVersion);
      fs.writeFileSync(senchaCfg, result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
    //console.log(`${app} Update to sencha.cfg completed`)




//    util.infLog('App creation completed')
//		util.infLog('Template: ' + chalk.green(TemplateDir))
    
    

		// util.infLog('Copying the framework from ' + Sdk)
		// var eDir = ApplicationDir + '/ext';fs.mkdirSync(eDir)

		// f='/index.js';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
		// f='/license.txt';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
		// f='/package.json';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
		// f='/cmd';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
    // f='/sass';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
    
    // var n = Sdk.indexOf("@sencha");
    // if (n == -1) {
    //   f='/build.xml';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
    //   f='/ext-bootstrap.js';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
    //   f='/version.properties';fs.copySync(Sdk+f,eDir+f);util.dbgLog(eDir+f+' created')
    //   f='/.sencha';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
    //   f='/classic';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
      
    //   f='/licenses';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
    //   f='/modern';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')
    //   f='/packages';fs.copySync(Sdk + f, eDir + f);util.dbgLog(eDir+f+' created')

    //   var fromBuild = Sdk + '/build'
    //   var toBuild = eDir + '/build'
    //   fs.mkdirSync(toBuild);util.dbgLog(toBuild+' created')
    //   fs.readdir(fromBuild, function(err, filenames) {
    //     filenames.forEach(function(filename) {
    //       if (filename.substr(filename.length - 3) == '.js') {
    //         util.dbgLog(toBuild + '/' + filename + ' created')
    //         fs.copySync(fromBuild + '/' + filename, toBuild + '/' + filename)
    //       }
    //     });
    //     util.infLog('Copying the framework is completed')
    //     util.infLog(chalk.green(`The application '${ApplicationName}' is ready in the '${ApplicationDir}' folder!`))

    //     var viewpackage = chalk.yellow(`cd ${ApplicationDir}/desktop/app/view; sn gen vp settings; cd ../../../`)
    //     var watch = chalk.yellow(`cd ${ApplicationDir}; sencha app watch -port 1841 moderndesktop`)
    //     console.log(help.finishText(ApplicationDir, viewpackage, watch))
    //   });
    //  }
  }
}
module.exports = app