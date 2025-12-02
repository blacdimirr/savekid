Ext.define('Traccar.store.SavekidChildrenStore', {
    extend: 'Ext.data.Store',
    alias: 'store.savekidChildren',
    storeId: 'savekidChildrenStore',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'birthDate', type: 'date', dateFormat: 'c' },
        { name: 'status', type: 'string' },
        { name: 'weight', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'conditions', type: 'string' },
        { name: 'deviceName', type: 'string' },
        { name: 'deviceId', type: 'int' }
    ],

    proxy: {
        type: 'ajax',
        url: '/api/savekid/children',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        listeners: {
            exception: function (proxy, response) {
                Ext.Msg.alert('Error', 'No se pudo cargar la lista de niños: ' + response.statusText);
            }
        }
    },

    autoLoad: true
});
