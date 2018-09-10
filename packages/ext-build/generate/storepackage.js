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
		var parms = options.parms
		if(parms[3] != undefined) {throw util.err('Only 1 parameter is allowed')}
		var StoreName = parms[2];util.dbgLog('StoreName: ' + StoreName)
		if(StoreName == undefined) {throw util.err('generate StorePackage - Store Name parameter is empty')}
		var ModelName = StoreName
		var NodeAppStorePackageTemplatesDir = path.join(NodeAppTemplatesDir + '/StorePackage');util.dbgLog('NodeAppStorePackageTemplatesDir: ' + NodeAppStorePackageTemplatesDir)
		var appName = util.getAppName(CurrWorkingDir);util.dbgLog('appName: ' + appName)
		var toFolder = getFolder(CurrWorkingDir);util.dbgLog('toFolder: ' + toFolder)
		if (toFolder != 'app') {throw 'generate StorePackage - must be run from an app folder'}

		var iSmallStore = StoreName.toLowerCase();util.dbgLog('iSmallStore: ' + iSmallStore)
		var iCapsStore = iSmallStore[0].toUpperCase() + iSmallStore.substring(1);util.dbgLog('iCapsStore: ' + iCapsStore)
		var storeFileName = iCapsStore + 'Store';util.dbgLog('storeFileName: ' + storeFileName)
		var StoreNameSmall = iSmallStore + 'store';util.dbgLog('StoreNameSmall: ' + StoreNameSmall)
		var storeFile = CurrWorkingDir + '/store/' + iCapsStore + 'Store.js';util.dbgLog('storeFile: ' + storeFile)
		if (fs.existsSync(storeFile)){throw storeFile + ' file exists.  Delete the file to re-create.'}

		var iSmallModel = ModelName.toLowerCase();util.dbgLog('iSmallModel: ' + iSmallModel)
		var iCapsModel = iSmallModel[0].toUpperCase() + iSmallModel.substring(1);util.dbgLog('iCapsModel: ' + iCapsModel)
		var modelFileName = iCapsModel + 'Store';util.dbgLog('modelFileName: ' + modelFileName)
		var ModelNameSmall = iSmallModel + 'store';util.dbgLog('ModelNameSmall: ' + ModelNameSmall)
		var modelFile = CurrWorkingDir + '/model/' + iCapsModel + 'Model.js';util.dbgLog('modelFile: ' + modelFile)
		if (fs.existsSync(modelFile)){throw modelFile + ' file exists.  Delete the file to re-create.'}

		var values = {
			appName: appName,
			storeFileName : storeFileName,
			modelFileName : modelFileName,
			storeNamespaceName: appName + '.'  + 'store' + '.'  + iCapsStore + 'Store',
			modelNamespaceName: appName + '.'  + 'model' + '.'  + iCapsModel + 'Model',
			storeNameSmall: StoreNameSmall,
			modelNameSmall: ModelNameSmall,
		}

		var totalStoreFileName = '{storeFileName}.js.tpl'
		var contentStore = fs.readFileSync(NodeAppStorePackageTemplatesDir + '/store/' + totalStoreFileName).toString()
		var storefiletemplate = _.template(totalStoreFileName);
		var fstore = storefiletemplate(values).slice(0, -4);
		var tplStore = new Ext.XTemplate(contentStore)
		var tstore = tplStore.apply(values)
		delete tplStore
		fs.writeFileSync(storeFile, tstore);
		util.infLog('Generated file ' + storeFile)

		var totalModelFileName = '{modelFileName}.js.tpl'
		var contentModel = fs.readFileSync(NodeAppStorePackageTemplatesDir + '/model/' + totalModelFileName).toString()
		var modelfiletemplate = _.template(totalModelFileName);
		var fmodel = modelfiletemplate(values).slice(0, -4);
		var tplModel = new Ext.XTemplate(contentModel)
		var tmodel = tplModel.apply(values)
		delete tplModel
		fs.writeFileSync(modelFile, tmodel);
		util.infLog('Generated file ' + modelFile)
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