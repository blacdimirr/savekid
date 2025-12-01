Ext.define('Traccar.view.savekid.SavekidChildrenView', {
    extend: 'Ext.grid.Panel',
    xtype: 'savekidChildrenView',

    requires: [
        'Traccar.store.SavekidChildrenStore',
        'Traccar.view.savekid.SavekidChildForm'
    ],

    title: 'Perfiles de niños',
    store: { type: 'savekidChildren' },

    tbar: [{
        text: 'Nuevo perfil',
        iconCls: 'x-fa fa-plus',
        handler: function (btn) {
            Ext.create('Traccar.view.savekid.SavekidChildForm', { title: 'Crear perfil' }).show();
        }
    }],

    columns: [{
        text: 'Nombre',
        dataIndex: 'name',
        flex: 1
    }, {
        text: 'Apellido',
        dataIndex: 'lastName',
        flex: 1
    }, {
        text: 'Estado',
        dataIndex: 'status',
        width: 120,
        renderer: function (value) {
            var color = value === 'ALERTA' ? 'tomato' : 'green';
            return '<span style="color:' + color + ';font-weight:bold">' + (value || 'OK') + '</span>';
        }
    }, {
        text: 'Fecha de nacimiento',
        dataIndex: 'birthDate',
        xtype: 'datecolumn',
        format: 'Y-m-d',
        width: 150
    }, {
        text: 'Dispositivo asociado',
        dataIndex: 'deviceName',
        flex: 1
    }, {
        xtype: 'actioncolumn',
        text: 'Acciones',
        width: 180,
        items: [{
            iconCls: 'x-fa fa-eye',
            tooltip: 'Ver perfil',
            handler: function (grid, rowIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                Ext.create('Ext.window.Window', {
                    title: 'Perfil de ' + rec.get('name'),
                    modal: true,
                    width: 980,
                    height: 720,
                    layout: 'fit',
                    items: [{
                        xtype: 'savekidChildProfilePanel',
                        childRecord: rec
                    }]
                }).show();
            }
        }, {
            iconCls: 'x-fa fa-pencil',
            tooltip: 'Editar',
            handler: function (grid, rowIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                Ext.create('Traccar.view.savekid.SavekidChildForm', {
                    title: 'Editar perfil',
                    record: rec
                }).show();
            }
        }, {
            iconCls: 'x-fa fa-trash',
            tooltip: 'Eliminar',
            handler: function (grid, rowIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                Ext.Msg.confirm('Eliminar', '¿Eliminar el perfil seleccionado?', function (choice) {
                    if (choice === 'yes') {
                        Ext.Ajax.request({
                            url: '/api/savekid/children/' + rec.get('id'),
                            method: 'DELETE',
                            success: function () {
                                grid.getStore().reload();
                                Ext.toast('Perfil eliminado correctamente');
                            },
                            failure: function (response) {
                                Ext.Msg.alert('Error', 'No se pudo eliminar el perfil: ' + response.statusText);
                            }
                        });
                    }
                });
            }
        }]
    }],

    listeners: {
        afterrender: function (grid) {
            grid.getStore().reload();
        }
    }
});
