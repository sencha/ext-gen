function init(context) {
	var toolkit = context.get("toolkit");
	//context.put("universal", toolkit == '');
	context.put("universal", true);
	// if(context.get("viewName") == 'gusmano') {
	// 	context.put("universal", true);
	// 	context.put("universalv2", true);
	// }
	
	context.put("classic", toolkit == 'classic');
	context.put("modern", toolkit == 'modern');
	context.put("fwIs60", /^6\.0.*/.test(context.get("frameworkVer")));
	//context.put("mjg", 'mjg');
	//console.log('***** template')
	//console.log(context)
	//console.log('***** template')
}