package org.traccar.service;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import org.traccar.model.Position;
import org.traccar.model.SavekidChild;
import org.traccar.model.SavekidHealthReport;
import org.traccar.storage.Storage;
import org.traccar.storage.StorageException;
import org.traccar.storage.query.Columns;
import org.traccar.storage.query.Condition;
import org.traccar.storage.query.Order;
import org.traccar.storage.query.Request;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Singleton
public class SavekidHealthService {

    @Inject
    private Storage storage;

    public SavekidHealthReport buildReport(SavekidChild child, String range) throws StorageException {
        SavekidHealthReport report = new SavekidHealthReport();

        if (child.getDeviceId() == 0) {
            return report;
        }

        Date to = new Date();
        Date from = resolveFrom(range, to);

        Position latest = storage.getObject(Position.class, new Request(
                new Columns.All(),
                new Condition.And(
                        new Condition.Equals("deviceId", child.getDeviceId()),
                        new Condition.LatestPositions(child.getDeviceId())),
                new Order("fixtime", true, 1)));

        if (latest != null) {
            report.setRecentVitals(extractVitals(latest));
            report.setLastLocation(extractLocation(latest));
        }

        var seriesConditions = new LinkedList<Condition>();
        seriesConditions.add(new Condition.Equals("deviceId", child.getDeviceId()));
        if (from != null) {
            seriesConditions.add(new Condition.Between("fixtime", from, to));
        }

        List<Position> positions = storage.getObjects(Position.class, new Request(
                new Columns.All(), Condition.merge(seriesConditions), new Order("fixtime")));

        report.setHeartSeries(buildSeries(positions, "heartRate"));
        report.setTemperatureSeries(buildSeries(positions, "bodyTemp"));
        report.setStepsSeries(buildSeries(positions, "steps"));
        report.setEvents(buildEvents(positions));

        return report;
    }

    private Date resolveFrom(String range, Date to) {
        if (range == null || range.isEmpty() || "24h".equalsIgnoreCase(range)) {
            return new Date(to.getTime() - TimeUnit.HOURS.toMillis(24));
        } else if ("week".equalsIgnoreCase(range) || "7d".equalsIgnoreCase(range)) {
            return new Date(to.getTime() - TimeUnit.DAYS.toMillis(7));
        } else if (range.endsWith("h")) {
            try {
                int hours = Integer.parseInt(range.substring(0, range.length() - 1));
                return new Date(to.getTime() - TimeUnit.HOURS.toMillis(hours));
            } catch (NumberFormatException ignored) {
                return null;
            }
        } else if (range.endsWith("d")) {
            try {
                int days = Integer.parseInt(range.substring(0, range.length() - 1));
                return new Date(to.getTime() - TimeUnit.DAYS.toMillis(days));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Map<String, Object> extractVitals(Position position) {
        Map<String, Object> vitals = new HashMap<>();
        copyAttribute(position, vitals, "heartRate");
        copyAttribute(position, vitals, "bodyTemp");
        copyAttribute(position, vitals, "steps");
        copyAttribute(position, vitals, "sleepStatus");
        vitals.put("time", position.getFixTime());
        return vitals;
    }

    private Map<String, Object> extractLocation(Position position) {
        Map<String, Object> data = new HashMap<>();
        data.put("latitude", position.getLatitude());
        data.put("longitude", position.getLongitude());
        data.put("time", position.getFixTime());
        data.put("address", position.getAddress());
        return data;
    }

    private void copyAttribute(Position position, Map<String, Object> target, String attribute) {
        if (position.getAttributes().containsKey(attribute)) {
            target.put(attribute, position.getAttributes().get(attribute));
        }
    }

    private List<Map<String, Object>> buildSeries(List<Position> positions, String attribute) {
        List<Map<String, Object>> series = new ArrayList<>();
        for (Position position : positions) {
            if (position.getAttributes().containsKey(attribute)) {
                Map<String, Object> point = new HashMap<>();
                point.put("timestamp", position.getFixTime());
                point.put("value", position.getAttributes().get(attribute));
                series.add(point);
            }
        }
        return series;
    }

    private List<Map<String, Object>> buildEvents(List<Position> positions) {
        List<Map<String, Object>> events = new ArrayList<>();
        for (Position position : positions) {
            if (position.getAttributes().containsKey(Position.KEY_ALARM)) {
                Map<String, Object> event = new HashMap<>();
                event.put("time", position.getFixTime());
                event.put("type", "ALARM");
                event.put("description", position.getAttributes().get(Position.KEY_ALARM));
                events.add(event);
            }
        }
        return events;
    }
}
