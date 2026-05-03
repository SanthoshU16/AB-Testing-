package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.Employee;
import com.armorbridge.armor_bridge.model.TrackingEvent;
import com.armorbridge.armor_bridge.service.EmployeeService;
import com.armorbridge.armor_bridge.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    @Autowired
    private EmployeeService employeeService;

    // 1x1 Transparent GIF Pixel
    private static final byte[] PIXEL_BYTES = new byte[] {
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
        (byte) 0x80, 0x00, 0x00, (byte) 0xff, (byte) 0xff, (byte) 0xff,
        0x00, 0x00, 0x00, 0x21, (byte) 0xf9, 0x04, 0x01, 0x00, 0x00,
        0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
        0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
    };

    // Public endpoint for Phishing Landing Page
    @PostMapping("/public/log")
    public String logPublicEvent(@RequestBody TrackingEvent event) throws ExecutionException, InterruptedException {
        return trackingService.logEvent(event);
    }

    // Public endpoint for tracking email opens via pixel
    @GetMapping("/pixel/{campaignId}/{employeeId}")
    public ResponseEntity<byte[]> trackEmailOpen(@PathVariable String campaignId, @PathVariable String employeeId) {
        try {
            Employee emp = employeeService.getEmployeeById(employeeId);
            TrackingEvent event = new TrackingEvent();
            event.setCampaignId(campaignId);
            event.setEmployeeId(employeeId);
            event.setEventType("email_opened");
            event.setCredentialAttempted(false);
            event.setTimestamp(System.currentTimeMillis());
            
            if (emp != null) {
                event.setEmployeeEmail(emp.getEmail());
                event.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
                event.setDepartment(emp.getDepartment());
            }

            trackingService.logEvent(event);
        } catch (Exception e) {
            System.err.println("Failed to log pixel tracking event: " + e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_GIF);
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0L);

        return new ResponseEntity<>(PIXEL_BYTES, headers, HttpStatus.OK);
    }

    // Admin endpoints
    @GetMapping("/campaign/{campaignId}")
    public List<TrackingEvent> getCampaignEvents(@PathVariable String campaignId) throws ExecutionException, InterruptedException {
        return trackingService.getEventsByCampaign(campaignId);
    }

    @GetMapping
    public List<TrackingEvent> getAllEvents() throws ExecutionException, InterruptedException {
        return trackingService.getAllEvents();
    }

    // Admin endpoint to reset reporting data
    @DeleteMapping("/reset")
    public ResponseEntity<String> resetReportingData() {
        try {
            trackingService.deleteAllEvents();
            return new ResponseEntity<>("All tracking events deleted successfully.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete tracking events: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
