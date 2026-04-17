package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.Campaign;
import com.armorbridge.armor_bridge.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @GetMapping
    public List<Campaign> getCampaigns() throws ExecutionException, InterruptedException {
        return campaignService.getAllCampaigns();
    }

    @PostMapping
    public String createCampaign(@RequestBody Campaign campaign) throws ExecutionException, InterruptedException {
        return campaignService.createCampaign(campaign);
    }

    @PutMapping("/{id}")
    public void updateCampaign(@PathVariable String id, @RequestBody Campaign campaign) {
        campaignService.updateCampaign(id, campaign);
    }
}
