package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.Campaign;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Campaign Scheduler — checks for scheduled campaigns every 30 seconds
 * and automatically launches them when their scheduled time has passed.
 */
@Service
public class CampaignScheduler {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every 60 seconds. Finds campaigns with status "scheduled"
     * whose scheduledAt timestamp is in the past, then launches them.
     */
    @Scheduled(fixedRate = 60000) // every 1 minute
    public void checkScheduledCampaigns() {
        try {
            long now = System.currentTimeMillis();
            List<Campaign> pendingCampaigns = campaignService.getPendingScheduledCampaigns(now);

            for (Campaign campaign : pendingCampaigns) {
                System.out.println("⏰ Auto-launching scheduled campaign: " + campaign.getName());

                // Update status to "active"
                HashMap<String, Object> updates = new HashMap<>();
                updates.put("status", "active");
                campaignService.updateCampaign(campaign.getId(), updates);

                // Launch the campaign
                emailService.launchCampaign(campaign.getId());

                System.out.println("✅ Scheduled campaign '" + campaign.getName() + "' launched successfully");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Scheduler error: " + e.getClass().getSimpleName() + " — " + e.getMessage());
            e.printStackTrace();
        }
    }
}

