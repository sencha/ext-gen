Ext.define('{viewNamespaceName}',{
  xtype: '{viewNameSmall}',
  cls: '{viewNameSmall}',
  controller: {type: '{viewNameSmall}controller'},
  viewModel: {type: '{viewNameSmall}model'},
  requires: [],
  extend: 'Ext.grid.Grid',
  store: {type: '{viewNameSmall}store'},
  columns: [
    { 
      text: 'Name',
      dataIndex: 'name',
      width: 100,
      cell: {userCls: 'bold'}
    },
    {text: 'Email',dataIndex: 'email',width: 230},
    {
      text: 'Phone',
      dataIndex: 'phone',
      width: 150 
    }
  ],
  listeners: {
    select: 'onItemSelected'
  }
})
