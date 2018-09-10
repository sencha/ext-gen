
Ext.define('{appName}.view.appointments2.Appointments2ViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.appointments2viewcontroller',

	onSort: function(button) {
		var store = this.getViewModel().getStore('appointments');
		if (button.tag == 'ASC') {
			button.setIconCls('x-fa fa-sort-amount-desc')
			button.tag = 'DESC'
		}
		else {
			button.setIconCls('x-fa fa-sort-amount-asc')
			button.tag = 'ASC'
		}
		store.sort('AptArrivalDtm', button.tag);
	},

	onDeleteAction: function(list, data) {
		var store = this.getViewModel().getStore('appointments');
		store.remove(data.record);
		store.save();
	}
	});