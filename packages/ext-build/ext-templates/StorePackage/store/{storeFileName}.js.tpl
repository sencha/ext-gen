Ext.define('{storeNamespaceName}', {
	extend: 'Ext.data.Store',
	alias: 'store.{storeNameSmall}',
	model: '{modelNamespaceName}',
//	autoLoad: true,

//	data: { items: [
//		{ name: 'Jean Luc', email: "jeanluc.picard@enterprise.com", phone: "555-111-1111" },
//		{ name: 'Worf',     email: "worf.moghsson@enterprise.com",  phone: "555-222-2222" },
//		{ name: 'Deanna',   email: "deanna.troi@enterprise.com",    phone: "555-333-3333" },
//		{ name: 'Data',     email: "mr.data@enterprise.com",        phone: "555-444-4444" }
//	]},
//	proxy: {
//		type: 'memory',
//		reader: {
//			type: 'json',
//			rootProperty: 'items'
//		}
//	}

//	requires: ['Ext.data.proxy.Rest',],
//	proxy: {
//		type: 'rest',
//		url: 'http://localhost/items',
//		reader: {
//			type: 'json',
//			rootProperty: 'items'
//		}
//	}

});
