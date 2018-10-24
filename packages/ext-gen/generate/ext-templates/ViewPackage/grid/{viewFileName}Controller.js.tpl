Ext.define('{viewNamespaceName}Controller', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.{viewNameSmall}controller',

  onItemSelected: function (sender, record) {
    Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
  },

  onConfirm: function (choice) {
    if (choice === 'yes') {
      //
    }
  }
})
