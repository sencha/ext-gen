A basic best practice template for Sencha Cmd 6.5.2

how to use: (assuming an install to ~/aaTemplate/basictemplate on your local machine)

sencha -sdk ~/aaExt/ext-6.5.2  generate app -modern -s ~/aaTemplate/basictemplate -r best ./best

sencha -sdk ~/aaExt/ext-6.5.2 generate app -modern -s ~/basictemplate -r MyExtApp ./MyExtApp




other info...

~/bin/Sencha/Cmd/6.5.2.15/plugins/ext/current/templates

sencha generate view home.HomeView;sencha generate view users.UsersView;sencha generate view groups.GroupsView;sencha generate view settings.SettingsView


{% 
//	if (values.viewName == 'gusmano') { values.Universal2 = true }
//	else { values.Universal2 = false }
//values.xuniversal = ''
//	var not62 = !values.frameworkIsV62 || values.frameworkIsV62 === 'false';
//	var not65 = !values.frameworkIsV65 || values.frameworkIsV65 === 'false';
//console.log('***** app.json')
//for (var p in values) {
//	if( values.hasOwnProperty(p) ) {
//		console.log(p + " , " + values[p]);
//	}
//}
//console.log('***** app.json')
//	if (values.themeName == 'default') {
//		values.classicTheme = "theme-triton";
//		values.modernTheme = "theme-material";
//		if (not62 && not65) {
//			values.modernTheme = "theme-triton";
//		}
//		if (values.toolkit == "classic") {
//			values.themeName = values.classicTheme;
//		}
//		else {
//			values.themeName = values.modernTheme;
//		}
//	}
//	else {
//		values.classicTheme = values.modernTheme = values.themeName;
//	}
%}