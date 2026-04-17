package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.TrackingEvent;
import com.armorbridge.armor_bridge.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    // Public endpoint for Phishing Landing Page
    @PostMapping("/public/log")
    public String logPublicEvent(@RequestBody TrackingEvent event) throws ExecutionException, InterruptedException {
        return trackingService.logEvent(event);
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
}
