Ext.define('Traccar.controller.SavekidController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.savekid',

    requires: [
        'Traccar.view.savekid.SavekidChildrenView',
        'Traccar.view.savekid.SavekidChildForm',
        'Traccar.view.savekid.SavekidChildProfilePanel'
    ],

    /**
     * Centraliza la creación de ventanas modales para los módulos SaveKID.
     */
    showWindow: function (componentConfig) {
        Ext.create('Ext.window.Window', Ext.apply({
            modal: true,
            width: 900,
            height: 640,
            layout: 'fit',
            autoShow: true
        }, componentConfig));
    },

    openChildrenList: function () {
        this.showWindow({
            title: 'Perfiles de niños',
            items: [{ xtype: 'savekidChildrenView' }]
        });
    },

    openChildrenStatus: function () {
        this.showWindow({
            title: 'Estado actual',
            items: [{ xtype: 'savekidChildProfilePanel', reference: 'childrenStatusPanel' }]
        });
    },

    openHealthHistory: function () {
        this.showWindow({
            title: 'Historial de salud',
            items: [{ xtype: 'savekidChildProfilePanel', reference: 'childrenHistoryPanel', showHistoryOnly: true }]
        });
    },

    openWeeklyReports: function () {
        this.showWindow({
            title: 'Reportes semanales',
            items: [{ xtype: 'savekidChildProfilePanel', reference: 'childrenWeeklyPanel', defaultRange: 'week' }]
        });
    }
});
