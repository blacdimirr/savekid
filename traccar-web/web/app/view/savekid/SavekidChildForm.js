Ext.define('Traccar.view.savekid.SavekidChildForm', {
    extend: 'Ext.window.Window',
    xtype: 'savekidChildForm',

    requires: [
        'Ext.form.Panel'
    ],

    modal: true,
    width: 500,
    layout: 'fit',
    bodyPadding: 10,

    initComponent: function () {
        var me = this;
        var deviceStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type: 'ajax',
                url: '/api/devices',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            },
            autoLoad: true
        });

        me.items = [{
            xtype: 'form',
            reference: 'childForm',
            defaults: {
                anchor: '100%',
                allowBlank: false,
                msgTarget: 'side'
            },
            items: [{
                fieldLabel: 'Nombre',
                name: 'name'
            }, {
                fieldLabel: 'Apellido',
                name: 'lastName'
            }, {
                xtype: 'datefield',
                fieldLabel: 'Fecha de nacimiento',
                name: 'birthDate',
                format: 'Y-m-d',
                submitFormat: 'c'
            }, {
                xtype: 'numberfield',
                fieldLabel: 'Peso (kg)',
                name: 'weight',
                allowBlank: true,
                minValue: 0
            }, {
                xtype: 'numberfield',
                fieldLabel: 'Altura (cm)',
                name: 'height',
                allowBlank: true,
                minValue: 0
            }, {
                xtype: 'textarea',
                fieldLabel: 'Condiciones médicas',
                name: 'conditions',
                allowBlank: true
            }, {
                xtype: 'combobox',
                fieldLabel: 'Estado',
                name: 'status',
                store: ['OK', 'ALERTA'],
                value: 'OK',
                forceSelection: true,
                editable: false
            }, {
                xtype: 'combobox',
                fieldLabel: 'Dispositivo',
                name: 'deviceId',
                store: deviceStore,
                valueField: 'id',
                displayField: 'name',
                forceSelection: true,
                queryMode: 'remote',
                editable: false
            }]
        }];

        me.buttons = [{
            text: 'Guardar',
            formBind: true,
            handler: function () {
                var form = me.down('form');
                if (form && form.isValid()) {
                    var values = form.getValues();
                    var url = '/api/savekid/children';
                    var method = 'POST';
                    if (me.record) {
                        url += '/' + me.record.get('id');
                        method = 'PUT';
                    }

                    Ext.Ajax.request({
                        url: url,
                        method: method,
                        jsonData: values,
                        success: function () {
                            Ext.toast('Perfil guardado correctamente');
                            me.close();
                            var store = Ext.getStore('savekidChildrenStore');
                            if (store) {
                                store.reload();
                            }
                        },
                        failure: function (response) {
                            Ext.Msg.alert('Error', 'No se pudo guardar el perfil: ' + response.statusText);
                        }
                    });
                }
            }
        }, {
            text: 'Cancelar',
            handler: function () {
                me.close();
            }
        }];

        if (me.record) {
            me.on('afterrender', function () {
                me.down('form').loadRecord(me.record);
            }, me, { single: true });
        }

        me.callParent(arguments);
    }
});
