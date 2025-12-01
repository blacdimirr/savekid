package org.traccar.model;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class SavekidHealthReport {

    private Map<String, Object> recentVitals = Collections.emptyMap();
    private Map<String, Object> lastLocation = Collections.emptyMap();
    private List<Map<String, Object>> heartSeries = Collections.emptyList();
    private List<Map<String, Object>> temperatureSeries = Collections.emptyList();
    private List<Map<String, Object>> stepsSeries = Collections.emptyList();
    private List<Map<String, Object>> events = Collections.emptyList();

    public Map<String, Object> getRecentVitals() {
        return recentVitals;
    }

    public void setRecentVitals(Map<String, Object> recentVitals) {
        this.recentVitals = recentVitals;
    }

    public Map<String, Object> getLastLocation() {
        return lastLocation;
    }

    public void setLastLocation(Map<String, Object> lastLocation) {
        this.lastLocation = lastLocation;
    }

    public List<Map<String, Object>> getHeartSeries() {
        return heartSeries;
    }

    public void setHeartSeries(List<Map<String, Object>> heartSeries) {
        this.heartSeries = heartSeries;
    }

    public List<Map<String, Object>> getTemperatureSeries() {
        return temperatureSeries;
    }

    public void setTemperatureSeries(List<Map<String, Object>> temperatureSeries) {
        this.temperatureSeries = temperatureSeries;
    }

    public List<Map<String, Object>> getStepsSeries() {
        return stepsSeries;
    }

    public void setStepsSeries(List<Map<String, Object>> stepsSeries) {
        this.stepsSeries = stepsSeries;
    }

    public List<Map<String, Object>> getEvents() {
        return events;
    }

    public void setEvents(List<Map<String, Object>> events) {
        this.events = events;
    }
}
