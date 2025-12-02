package org.traccar.api.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.traccar.api.BaseResource;
import org.traccar.model.Device;
import org.traccar.model.SavekidChild;
import org.traccar.model.SavekidHealthReport;
import org.traccar.model.User;
import org.traccar.service.SavekidHealthService;
import org.traccar.storage.StorageException;
import org.traccar.storage.query.Columns;
import org.traccar.storage.query.Condition;
import org.traccar.storage.query.Order;
import org.traccar.storage.query.Request;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

@Path("savekid/children")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SavekidChildResource extends BaseResource {

    @Inject
    private SavekidHealthService healthService;

    @GET
    public Map<String, Collection<SavekidChild>> get(@QueryParam("deviceId") Long deviceId)
            throws StorageException {

        var conditions = new LinkedList<Condition>();

        if (deviceId != null) {
            permissionsService.checkPermission(Device.class, getUserId(), deviceId);
            conditions.add(new Condition.Equals("deviceId", deviceId));
        }

        if (permissionsService.notAdmin(getUserId())) {
            conditions.add(new Condition.Equals("userId", getUserId()));
        }

        Collection<SavekidChild> children = storage.getObjects(SavekidChild.class,
                new Request(new Columns.All(), Condition.merge(conditions), new Order("name")));

        enrich(children);

        Map<String, Collection<SavekidChild>> response = new HashMap<>();
        response.put("data", children);
        return response;
    }

    @GET
    @Path("{id}")
    public SavekidChild getById(@PathParam("id") long id) throws StorageException {
        SavekidChild child = requireChild(id);
        enrich(child);
        return child;
    }

    @GET
    @Path("by-device/{deviceId}")
    public SavekidChild getByDevice(@PathParam("deviceId") long deviceId) throws StorageException {
        permissionsService.checkPermission(Device.class, getUserId(), deviceId);
        SavekidChild child = storage.getObject(SavekidChild.class, new Request(
                new Columns.All(), new Condition.Equals("deviceId", deviceId)));
        if (child != null) {
            checkOwner(child);
            enrich(child);
        }
        return child;
    }

    @POST
    public Response add(SavekidChild entity) throws StorageException {
        entity.setId(0);
        if (entity.getUserId() == 0) {
            entity.setUserId(getUserId());
        }
        if (entity.getStatus() == null) {
            entity.setStatus("OK");
        }
        permissionsService.checkUser(getUserId(), entity.getUserId());
        long id = storage.addObject(entity, new Request(new Columns.Exclude("id")));
        entity.setId(id);
        return Response.ok(entity).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") long id, SavekidChild entity) throws StorageException {
        SavekidChild existing = requireChild(id);
        entity.setId(id);
        entity.setUserId(existing.getUserId());
        if (entity.getStatus() == null) {
            entity.setStatus(existing.getStatus());
        }
        storage.updateObject(entity, new Request(
                new Columns.Exclude("id", "userId"), new Condition.Equals("id", id)));
        enrich(entity);
        return Response.ok(entity).build();
    }

    @DELETE
    @Path("{id}")
    public Response remove(@PathParam("id") long id) throws StorageException {
        SavekidChild child = requireChild(id);
        storage.removeObject(SavekidChild.class, new Request(new Condition.Equals("id", id)));
        return Response.noContent().build();
    }

    @GET
    @Path("{id}/health")
    public SavekidHealthReport getHealth(@PathParam("id") long id, @QueryParam("range") String range)
            throws StorageException {
        SavekidChild child = requireChild(id);
        permissionsService.checkPermission(Device.class, getUserId(), child.getDeviceId());
        return healthService.buildReport(child, range);
    }

    private SavekidChild requireChild(long id) throws StorageException {
        SavekidChild child = storage.getObject(SavekidChild.class, new Request(
                new Columns.All(), new Condition.Equals("id", id)));
        if (child == null) {
            throw new IllegalArgumentException("Child not found");
        }
        checkOwner(child);
        return child;
    }

    private void checkOwner(SavekidChild child) throws StorageException {
        if (permissionsService.notAdmin(getUserId())) {
            permissionsService.checkUser(getUserId(), child.getUserId());
        }
    }

    private void enrich(Collection<SavekidChild> children) throws StorageException {
        for (SavekidChild child : children) {
            enrich(child);
        }
    }

    private void enrich(SavekidChild child) throws StorageException {
        if (child.getDeviceId() > 0) {
            Device device = storage.getObject(Device.class, new Request(
                    new Columns.All(), new Condition.And(
                            new Condition.Equals("id", child.getDeviceId()),
                            new Condition.Permission(User.class, getUserId(), Device.class))));
            if (device != null) {
                child.set("deviceName", device.getName());
            }
        }
    }
}
