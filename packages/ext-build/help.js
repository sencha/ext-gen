var chalk = require('chalk');
exports.infoText = `
to invoke:
${chalk.green('*')} ext-build

Examples (replace --sdk with your path to the Ext JS sdk):
${chalk.green('*')} ext-build generate app --sdk '/Sencha/ext-6.x.x' --template 'universalmodern' MyApp ./MyApp
${chalk.green('*')} ext-build generate app --template 'moderndesktop' --sdk '/Sencha/ext-6.x.x' ModernDesktop ./ModernDesktop
${chalk.green('*')} ext-build generate app --template 'classicdesktop' --sdk '/Sencha/ext-6.x.x' ClassicDesktop ./ClassicDesktop
${chalk.green('*')} ext-build generate app --template 'universalmodernclassic' --sdk '/Sencha/ext-6.x.x' UMC ./UMC
${chalk.green('*')} ext-build gen app -s '/Sencha/ext-6.x.x' -t 'universalmodern' MyApp ./MyApp
${chalk.green('*')} ext-build g a -s '/Sencha/ext-6.x.x' -t 'universalmodern' MyApp ./MyApp
${chalk.green('*')} ext-build generate viewpackage --profile desktop --viewname settings --include-scss
${chalk.green('*')} ext-build g vp -p desktop -v settings -i
${chalk.green('*')} ext-build generate viewpackage --viewname settings
${chalk.green('*')} ext-build g vp -v settings
${chalk.green('*')} ext-build generate storepackage employee

Commands Available
${chalk.green('*')} ext-build generate app (name) (path)
${chalk.green('*')} ext-build generate viewpackage (profile) (viewname)
${chalk.green('*')} ext-build generate viewpackage (view)
${chalk.green('*')} ext-build generate storepackage (store)

Commands Options
${chalk.green('*')} generate, gen, g
${chalk.green('*')} application, app, a
${chalk.green('*')} viewpackage, vp
${chalk.green('*')} storepackage, sp

Options Available
${chalk.green('*')} --debug -d (shows debug messages)
${chalk.green('*')} --sdk -s (path to Ext JS sdk - currently required for gen app, no running from sdk folder...)
${chalk.green('*')} --template -t (name of app template to use - only one currently - universalmodern)
${chalk.green('*')} --viewname -v (name of view package to use, required for gen viewpackage)
${chalk.green('*')} --profile -p (name of profile to use, required for gen viewpackage. Optional - if not specified view created in shared directory)
${chalk.green('*')} --include-scss -i (when provided this param, view.scss will be generated otherwise not)
`
//${chalk.green('*')} --force (deletes application, if present, before generate app (BE CAREFUL WITH THIS!))
//${chalk.green('*')} --builds -b (--builds "desktop:modern,theme-material;phone:modern,theme-material;" is default)
exports.finishText = function finishText(ApplicationDir, viewpackage, watch) { 
	return`
${chalk.green('********************************************')}

To add a View Package to the moderndesktop build:

${viewpackage}

To test the application, type the following: 
(note: you can change port number and 'moderndesktop' to 'modernphone')

${watch}

${chalk.green('********************************************')}
`
}

//${menuFile}menu.json:
exports.menuText = function menuText(viewName, viewDir) {
	return`
${chalk.green('********************************************')}

View package ${viewName} was created at ${viewDir}

${chalk.green('********************************************')}
`
}