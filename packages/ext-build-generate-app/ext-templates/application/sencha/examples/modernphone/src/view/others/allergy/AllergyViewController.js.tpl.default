
Ext.define('{appName}.view.allergy.AllergyViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.allergyviewcontroller',
	
	onSort: function(button) {
		var store = this.getViewModel().getStore('allergies');
		if (button.tag == 'ASC') {
			button.setIconCls('x-fa fa-sort-amount-desc')
			button.tag = 'DESC'
		}
		else {
			button.setIconCls('x-fa fa-sort-amount-asc')
			button.tag = 'ASC'
		}
		store.sort('CreateDtm', button.tag);
	}

});
