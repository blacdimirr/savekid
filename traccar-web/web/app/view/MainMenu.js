Ext.define('Traccar.view.MainMenu', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'mainMenu',

    requires: [
        'Traccar.controller.SavekidController'
    ],

    controller: 'savekid',

    ui: 'navigation',
    vertical: true,
    width: 240,

    defaults: {
        xtype: 'button',
        margin: '4 0',
        ui: 'navigation',
        scale: 'medium',
        align: 'stretch'
    },

    items: [{
        text: 'Dashboard',
        iconCls: 'x-fa fa-map',
        tooltip: 'Mapa y dispositivos'
    }, {
        text: 'Reportes',
        iconCls: 'x-fa fa-file-text-o'
    }, {
        xtype: 'splitbutton',
        text: 'SaveKID',
        iconCls: 'x-fa fa-child',
        tooltip: 'Herramientas SaveKID',
        menu: [{
            text: 'Perfiles de niños',
            iconCls: 'x-fa fa-users',
            handler: 'openChildrenList'
        }, {
            text: 'Estado actual',
            iconCls: 'x-fa fa-heartbeat',
            handler: 'openChildrenStatus'
        }, {
            text: 'Historial de salud',
            iconCls: 'x-fa fa-area-chart',
            handler: 'openHealthHistory'
        }, {
            text: 'Reportes semanales',
            iconCls: 'x-fa fa-calendar',
            handler: 'openWeeklyReports'
        }]
    }]
});
