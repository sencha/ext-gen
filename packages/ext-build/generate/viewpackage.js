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
	_.templateSettings = { 
		interpolate: /\{(.+?)\}/g,
		evaluate: /\<\<=(.+?)\>\>/g
	};
	
	exports.init = function init(CurrWorkingDir, pathSenchaCmd, options, NodeAppTemplatesDir) { 
	var profile;
	var ViewName;

	if (options.hasOwnProperty('viewname')) {
		ViewName = options.viewname;
		profile = options.profile || 'shared';
	} else {
		var parms = options.parms

		console.log(parms[3])
		if(parms[3] == undefined) {
		  util.errLog('3 parameters needed')
		  //throw util.err('Only 1 parameter is allowed')
		}
		var profile = parms[2];
		var ViewName = parms[3];
	}
//    console.log(ViewName)
//    util.infLog('ViewName: ' + ViewName)
	if(ViewName == undefined) {throw util.err('View Name parameter is empty')}
    var NodeAppViewPackageTemplatesDir = path.join(NodeAppTemplatesDir + '/ViewPackage');
//    util.infLog('NodeAppViewPackageTemplatesDir: ' + NodeAppViewPackageTemplatesDir)

    var CurrWorkingDirRoot = CurrWorkingDir
    var appName = util.getAppName(CurrWorkingDir);
//    util.infLog('appName: ' + appName)
    var toFolder = getFolder(CurrWorkingDir);
    //util.infLog('toFolder: ' + toFolder)
		if (toFolder != 'view') {
      var ff, ff_desktop, ff_view;
      ff = require('node-find-folder');
      //console.log(process.cwd())
      process.chdir(`app/${profile}`)
      //console.log(process.cwd())
      ff_view = new ff('view');
      //util.infLog('ff_view: ' + ff_view)
      process.chdir(ff_view.toString())
      var viewFolder = process.cwd()
      //console.log(d)
      CurrWorkingDir = viewFolder
      //util.infLog('Must be run from a view folder')
    }
    var dir = CurrWorkingDir + '/' + ViewName;
    //util.infLog('folder: ' + dir)
		if (fs.existsSync(dir)){throw dir + ' folder exists.  Delete the folder to re-create.'}
    var iSmall = ViewName.toLowerCase();
    //util.infLog('iSmall: ' + iSmall)
    var iCaps = iSmall[0].toUpperCase() + iSmall.substring(1);
    //util.infLog('iCaps: ' + iCaps)
    var viewFileName = iCaps + 'View';
    //util.infLog('viewFileName: ' + viewFileName)
    var viewNameSmall = iSmall + 'view';
    //util.infLog('viewNameSmall: ' + viewNameSmall)
    var menuPath = `resources/shared/data/`;
    //util.infLog('menuPath: ' + menuPath)
		var values = {
			appName: appName,
			viewFileName : viewFileName,
			viewName: iSmall + '.' + viewFileName,
			viewNamespaceName: appName + '.'  + 'view.' + iSmall + '.' + viewFileName,
			viewBaseClass: "Ext.panel.Panel",
			viewNameSmall: viewNameSmall
		}
		fs.mkdirSync(dir);
    //util.infLog(dir + ' created')
		fs.readdir(NodeAppViewPackageTemplatesDir, function(err, filenames) {
			filenames.forEach(function(filename) {
				var content = fs.readFileSync(NodeAppViewPackageTemplatesDir + '/' + filename).toString()
				if (filename.substr(filename.length - 8) == 'json.tpl') { return }
				var filetemplate = _.template(filename);
				var f = filetemplate(values).slice(0, -4);
				var folderAndFile = NodeAppViewPackageTemplatesDir + '/' + filename
				var tpl = new Ext.XTemplate(content)
				var t = tpl.apply(values)
				delete tpl
				fs.writeFileSync(dir + '/' + f, t);
				util.infLog('Generated file ' + dir + '/' + f)
			});
			/* newMenu = `{ "text": "${iCaps}", "iconCls": "x-fa fa-cog", "xtype": "${viewNameSmall}", "leaf": true }`
			var item = chalk.yellow(newMenu + ',')
			var itemphone = chalk.yellow(`{ "text": "${iCaps}", "tag": "${viewNameSmall}" },`)

			var menuFile = `${CurrWorkingDirRoot}/resources/${profile}/menu.json`
			var menuJson = fs.existsSync(menuFile) && JSON.parse(fs.readFileSync(menuFile, 'utf-8'))
			if(menuJson) {
				menuJson.children.push(JSON.parse(newMenu))
				fs.writeFileSync(menuFile, JSON.stringify(menuJson), 'utf8')
			}
			console.log(help.menuText(menuFile, item, itemphone)); */

			console.log(help.menuText(ViewName, dir));
		});
	}

	function getFolder(val) { 
		if (val == undefined) {return ''}
		var fullPath = val; 
		var path = fullPath.split('/'); 
		var cwd = path[path.length-1]; 
		return cwd; 
	}

}
catch(e) {
	console.log('ddd' + e)
}