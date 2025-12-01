Ext.define('Traccar.view.savekid.SavekidChildProfilePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'savekidChildProfilePanel',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Time',
        'Ext.chart.series.Line',
        'Traccar.store.SavekidChildrenStore'
    ],

    scrollable: true,
    bodyPadding: 10,

    config: {
        childRecord: null,
        showHistoryOnly: false,
        defaultRange: '24h'
    },

    initComponent: function () {
        var me = this;

        me.childStore = Ext.create('Traccar.store.SavekidChildrenStore');
        me.heartStore = Ext.create('Ext.data.Store', { fields: ['timestamp', 'value'] });
        me.tempStore = Ext.create('Ext.data.Store', { fields: ['timestamp', 'value'] });
        me.stepsStore = Ext.create('Ext.data.Store', { fields: ['timestamp', 'value'] });
        me.eventsStore = Ext.create('Ext.data.Store', { fields: ['time', 'type', 'description'] });

        Ext.apply(me, {
            defaults: { margin: '0 0 14 0' },
            items: [
                me.buildHeader(),
                me.buildVitalsPanel(),
                me.buildEventsGrid(),
                me.buildCharts()
            ]
        });

        me.callParent(arguments);

        me.childStore.on('load', function (store) {
            if (!me.getChildRecord() && store.getCount() > 0) {
                me.applyChildSelection(store.first());
            }
        });

        me.on('afterrender', function () {
            if (me.getChildRecord()) {
                me.applyChildSelection(me.getChildRecord());
            } else if (!me.childStore.isLoaded()) {
                me.childStore.load();
            }
        }, me);
    },

    buildHeader: function () {
        var me = this;
        return {
            xtype: 'container',
            layout: 'vbox',
            items: [{
                xtype: 'container',
                layout: 'hbox',
                width: '100%',
                margin: '0 0 10 0',
                items: [{
                    xtype: 'combobox',
                    fieldLabel: 'Niño',
                    labelAlign: 'top',
                    store: me.childStore,
                    displayField: 'name',
                    valueField: 'id',
                    queryMode: 'local',
                    forceSelection: true,
                    flex: 1,
                    editable: false,
                    listeners: {
                        select: function (combo, record) {
                            me.applyChildSelection(record);
                        }
                    }
                }]
            }, {
                xtype: 'container',
                layout: 'hbox',
                width: '100%',
                items: [{
                    xtype: 'component',
                    flex: 2,
                    itemId: 'profileHeaderTpl',
                    tpl: '<div><h2>{name} {lastName}</h2><p>Nacido el {birthDate:date("Y-m-d")}</p>'
                        + '<p>Dispositivo: {deviceName}</p><p>Condiciones: {conditions}</p></div>',
                    data: me.getChildRecord() ? me.getChildRecord().data : {}
                }, {
                    xtype: 'container',
                    flex: 1,
                    defaults: { xtype: 'displayfield', labelAlign: 'top', labelSeparator: '' },
                    items: [{
                        fieldLabel: 'Estado',
                        itemId: 'childStatusDisplay',
                        value: '--'
                    }, {
                        fieldLabel: 'Última ubicación',
                        itemId: 'lastLocationDisplay',
                        value: 'Pendiente de cargar'
                    }]
                }]
            }]
        };
    },

    buildVitalsPanel: function () {
        var me = this;
        return {
            xtype: 'fieldset',
            title: 'Datos fisiológicos recientes',
            layout: 'hbox',
            defaults: { flex: 1, xtype: 'container', padding: '0 10 0 0' },
            items: [{
                html: '<h3>Frecuencia cardíaca</h3><div class="vital-heart">-- bpm</div>',
                itemId: 'heartValue'
            }, {
                html: '<h3>Temperatura</h3><div class="vital-temp">-- °C</div>',
                itemId: 'tempValue'
            }, {
                html: '<h3>Pasos</h3><div class="vital-steps">--</div>',
                itemId: 'stepsValue'
            }]
        };
    },

    buildEventsGrid: function () {
        var me = this;
        return {
            xtype: 'grid',
            title: 'Últimos eventos',
            store: me.eventsStore,
            height: 200,
            columns: [{
                text: 'Fecha', dataIndex: 'time', xtype: 'datecolumn', format: 'Y-m-d H:i', flex: 1
            }, {
                text: 'Tipo', dataIndex: 'type', flex: 1
            }, {
                text: 'Descripción', dataIndex: 'description', flex: 2
            }]
        };
    },

    buildCharts: function () {
        var me = this;
        return {
            xtype: 'container',
            layout: 'vbox',
            defaults: { xtype: 'cartesian', height: 240, width: '100%', insetPadding: 10 },
            items: [{
                title: 'Últimas 24h - Frecuencia cardíaca',
                store: me.heartStore,
                axes: [{ type: 'numeric', position: 'left', title: 'bpm' },
                    { type: 'time', position: 'bottom', title: 'Hora', dateFormat: 'H:i' }],
                series: [{ type: 'line', xField: 'timestamp', yField: 'value', marker: true }]
            }, {
                title: 'Últimas 24h - Temperatura',
                store: me.tempStore,
                axes: [{ type: 'numeric', position: 'left', title: '°C' },
                    { type: 'time', position: 'bottom', title: 'Hora', dateFormat: 'H:i' }],
                series: [{ type: 'line', xField: 'timestamp', yField: 'value', marker: true }]
            }, {
                title: 'Pasos diarios',
                store: me.stepsStore,
                axes: [{ type: 'numeric', position: 'left', title: 'Pasos' },
                    { type: 'time', position: 'bottom', title: 'Fecha', dateFormat: 'm-d' }],
                series: [{ type: 'line', xField: 'timestamp', yField: 'value', marker: true }]
            }]
        };
    },

    applyChildSelection: function (record) {
        this.setChildRecord(record);
        if (record) {
            var combo = this.down('combobox');
            if (combo) {
                combo.setValue(record.get('id'));
            }
            this.updateHeader(record);
            this.refreshData();
        }
    },

    updateHeader: function (record) {
        var header = this.down('#profileHeaderTpl');
        if (header) {
            header.update(record ? record.data : {});
        }
        var statusField = this.down('#childStatusDisplay');
        if (statusField) {
            var status = record ? record.get('status') : null;
            var color = status === 'ALERTA' ? 'tomato' : 'green';
            statusField.setValue(status ? '<span style="color:' + color + ';font-weight:bold">'
                + status + '</span>' : '--');
        }
    },

    updateLocation: function (location) {
        var locationField = this.down('#lastLocationDisplay');
        if (locationField) {
            if (location && Ext.isDefined(location.latitude) && Ext.isDefined(location.longitude)) {
                var text = Ext.String.format('{0}, {1} ({2:date("Y-m-d H:i")})',
                    location.latitude, location.longitude, new Date(location.time));
                if (location.address) {
                    text += ' - ' + location.address;
                }
                locationField.setValue(text);
            } else {
                locationField.setValue('Pendiente de cargar');
            }
        }
    },

    refreshData: function () {
        var me = this;
        var record = me.getChildRecord();
        if (!record) {
            return;
        }

        Ext.Ajax.request({
            url: '/api/savekid/children/' + record.get('id') + '/health',
            method: 'GET',
            params: { range: me.getDefaultRange() },
            success: function (response) {
                var payload = Ext.decode(response.responseText);
                me.updateHeader(record);
                me.updateLocation(payload.lastLocation);
                me.updateVitals(payload.recentVitals || {});
                me.heartStore.setData(payload.heartSeries || []);
                me.tempStore.setData(payload.temperatureSeries || []);
                me.stepsStore.setData(payload.stepsSeries || []);
                me.eventsStore.setData(payload.events || []);
            },
            failure: function (response) {
                Ext.Msg.alert('Error', 'No se pudo cargar el perfil: ' + response.statusText);
            }
        });
    },

    updateVitals: function (vitals) {
        var heart = this.down('#heartValue');
        var temp = this.down('#tempValue');
        var steps = this.down('#stepsValue');

        if (heart) { heart.setHtml('<h3>Frecuencia cardíaca</h3><div class="vital-heart">'
            + (vitals.heartRate || '--') + ' bpm</div>'); }
        if (temp) { temp.setHtml('<h3>Temperatura</h3><div class="vital-temp">'
            + (vitals.bodyTemp || '--') + ' °C</div>'); }
        if (steps) { steps.setHtml('<h3>Pasos</h3><div class="vital-steps">'
            + (vitals.steps || '--') + '</div>'); }
    }
});
