package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.Campaign;
import com.armorbridge.armor_bridge.service.CampaignService;
import com.armorbridge.armor_bridge.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public List<Campaign> getCampaigns() throws ExecutionException, InterruptedException {
        return campaignService.getAllCampaigns();
    }

    @GetMapping("/{id}")
    public Campaign getCampaign(@PathVariable String id) throws ExecutionException, InterruptedException {
        return campaignService.getCampaign(id);
    }

    @PostMapping
    public String createCampaign(@RequestBody Campaign campaign) throws ExecutionException, InterruptedException {
        return campaignService.createCampaign(campaign);
    }

    @PutMapping("/{id}")
    public void updateCampaign(@PathVariable String id, @RequestBody java.util.Map<String, Object> updates) {
        campaignService.updateCampaign(id, updates);
    }

    @PostMapping("/{id}/launch")
    public void launchCampaign(@PathVariable String id) {
        emailService.launchCampaign(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCampaign(@PathVariable String id) {
        campaignService.deleteCampaign(id);
    }
}
