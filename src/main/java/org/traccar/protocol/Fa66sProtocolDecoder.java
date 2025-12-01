/*
 * Copyright 2025 SaveKID contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.traccar.protocol;

import io.netty.channel.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.traccar.BaseProtocolDecoder;
import org.traccar.helper.DateBuilder;
import org.traccar.helper.UnitsConverter;
import org.traccar.model.Position;
import org.traccar.session.DeviceSession;
import org.traccar.Protocol;

import java.net.SocketAddress;
import java.util.Arrays;
import java.util.Locale;
import java.util.TimeZone;

public class Fa66sProtocolDecoder extends BaseProtocolDecoder {

    private static final Logger LOGGER = LoggerFactory.getLogger(Fa66sProtocolDecoder.class);

    public Fa66sProtocolDecoder(Protocol protocol) {
        super(protocol);
    }

    private static String sanitize(String sentence) {
        String result = sentence.trim();
        if (result.startsWith("[")) {
            int endIndex = result.lastIndexOf(']');
            if (endIndex > 0) {
                result = result.substring(1, endIndex);
            }
        }
        if (result.startsWith("$")) {
            result = result.substring(1);
        }
        if (result.toUpperCase(Locale.ROOT).startsWith("FA66S")) {
            result = result.substring(5);
            if (result.startsWith(",")) {
                result = result.substring(1);
            }
        }
        return result;
    }

    private static Integer toInteger(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Double toDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Position decodeSentence(DeviceSession deviceSession, String[] values) {
        if (values.length < 12) {
            LOGGER.warn("FA66S message rejected due to insufficient fields: {}", Arrays.toString(values));
            return null;
        }

        int index = 0;

        Position position = new Position(getProtocolName());
        position.setDeviceId(deviceSession.getDeviceId());

        Integer dateField = toInteger(values[index++]);
        Integer timeField = toInteger(values[index++]);
        if (dateField == null || timeField == null) {
            LOGGER.warn("FA66S message missing date or time");
            return null;
        }

        int day = dateField / 10000;
        int month = dateField % 10000 / 100;
        int year = dateField % 100;

        int hour = timeField / 10000;
        int minute = timeField % 10000 / 100;
        int second = timeField % 100;

        position.setTime(new DateBuilder(TimeZone.getTimeZone("UTC"))
                .setDate(year, month, day)
                .setTime(hour, minute, second)
                .getDate());

        position.setValid("A".equalsIgnoreCase(values[index++]));

        Double latitude = toDouble(values[index++]);
        Double longitude = toDouble(values[index++]);
        if (latitude != null && longitude != null) {
            position.setLatitude(latitude);
            position.setLongitude(longitude);
        } else {
            position.setValid(false);
        }

        Double speedKph = toDouble(values[index++]);
        if (speedKph != null) {
            position.setSpeed(UnitsConverter.knotsFromKph(speedKph));
        }

        Double course = toDouble(values[index++]);
        if (course != null) {
            position.setCourse(course);
        }

        Integer heartRate = toInteger(values[index++]);
        if (heartRate != null) {
            position.set("heartRate", heartRate);
        }

        Double bodyTemp = toDouble(values[index++]);
        if (bodyTemp != null) {
            position.set("bodyTemp", bodyTemp);
        }

        Integer steps = toInteger(values[index++]);
        if (steps != null) {
            position.set("steps", steps);
        }

        if (index < values.length) {
            String sleepStatus = values[index++];
            if (!sleepStatus.isEmpty()) {
                position.set("sleepStatus", sleepStatus);
            }
        }

        if (index < values.length) {
            Integer sos = toInteger(values[index]);
            if (sos != null && sos > 0) {
                position.set(Position.KEY_ALARM, Position.ALARM_SOS);
            }
        }

        return position;
    }

    @Override
    protected Object decode(Channel channel, SocketAddress remoteAddress, Object msg) throws Exception {

        if (!(msg instanceof String)) {
            return null;
        }

        String sentence = sanitize((String) msg);
        if (sentence.isEmpty()) {
            return null;
        }

        String[] fields = sentence.split(",");
        if (fields.length < 2) {
            return null;
        }

        String deviceId = fields[0];
        DeviceSession deviceSession = getDeviceSession(channel, remoteAddress, deviceId);
        if (deviceSession == null) {
            return null;
        }

        String[] payload = new String[fields.length - 1];
        System.arraycopy(fields, 1, payload, 0, payload.length);

        return decodeSentence(deviceSession, payload);
    }
}
