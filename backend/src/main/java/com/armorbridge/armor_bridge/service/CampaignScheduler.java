package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.Campaign;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Campaign Scheduler — checks for scheduled campaigns every 60 seconds
 * and automatically launches them when their scheduled time has passed.
 */
@Service
public class CampaignScheduler {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private EmailService emailService;

    // Track the last error message to avoid flooding logs with identical warnings
    private String lastErrorMessage = null;
    private int suppressedCount = 0;

    /**
     * Runs every 60 seconds. Finds campaigns with status "scheduled"
     * whose scheduledAt timestamp is in the past, then launches them.
     */
    @Scheduled(fixedRate = 60000) // every 1 minute
    public void checkScheduledCampaigns() {
        try {
            long now = System.currentTimeMillis();
            List<Campaign> pendingCampaigns = campaignService.getPendingScheduledCampaigns(now);

            // Clear error tracking on success
            if (lastErrorMessage != null) {
                System.out.println("✅ Scheduler: Connection restored — back to normal.");
                lastErrorMessage = null;
                suppressedCount = 0;
            }

            for (Campaign campaign : pendingCampaigns) {
                System.out.println("⏰ Auto-launching scheduled campaign: " + campaign.getName());

                // Update status to "active"
                HashMap<String, Object> updates = new HashMap<>();
                updates.put("status", "active");
                campaignService.updateCampaign(campaign.getId(), updates);

                // Launch the campaign
                var targets = emailService.getTargetsForCampaign(campaign.getId());
                emailService.launchCampaignAsync(campaign.getId(), targets);

                System.out.println("✅ Scheduled campaign '" + campaign.getName() + "' initiated with " + targets.size() + " targets");

            }
        } catch (Exception e) {
            // Find root cause
            Throwable cause = e;
            while (cause.getCause() != null) {
                cause = cause.getCause();
            }
            String errorMsg = cause.getClass().getSimpleName() + " — " + cause.getMessage();

            // Only log if it's a new/different error
            if (!errorMsg.equals(lastErrorMessage)) {
                if (suppressedCount > 0) {
                    System.err.println("   (suppressed " + suppressedCount + " identical warnings)");
                }
                System.err.println("⚠️ Scheduler: " + errorMsg);
                lastErrorMessage = errorMsg;
                suppressedCount = 0;
            } else {
                suppressedCount++;
            }
        }
    }
}
