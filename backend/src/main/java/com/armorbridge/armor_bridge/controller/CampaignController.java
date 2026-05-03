package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.Campaign;
import com.armorbridge.armor_bridge.service.CampaignService;
import com.armorbridge.armor_bridge.service.EmailService;
import com.armorbridge.armor_bridge.service.TemplateService;
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

    @Autowired
    private TemplateService templateService;

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
    public void updateCampaign(@PathVariable String id, @RequestBody java.util.Map<String, Object> updates) throws ExecutionException, InterruptedException {
        campaignService.updateCampaign(id, updates);
    }

    @PostMapping("/{id}/launch")
    public void launchCampaign(@PathVariable String id) {
        emailService.launchCampaign(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCampaign(@PathVariable String id) throws ExecutionException, InterruptedException {
        campaignService.deleteCampaign(id);
    }

    @DeleteMapping("/all")
    public void deleteAllCampaigns() throws ExecutionException, InterruptedException {
        campaignService.deleteAllCampaigns();
    }

    /**
     * Public endpoint: Returns minimal template info for the phishing landing page
     * to determine which branded login page to show (Google, Microsoft, etc.)
     */
    @GetMapping("/{id}/theme")
    public java.util.Map<String, String> getCampaignTheme(@PathVariable String id) throws ExecutionException, InterruptedException {
        Campaign campaign = campaignService.getCampaign(id);
        java.util.Map<String, String> result = new java.util.HashMap<>();
        if (campaign != null) {
            result.put("templateName", campaign.getTemplateName() != null ? campaign.getTemplateName() : "");
            result.put("templateId", campaign.getTemplateId() != null ? campaign.getTemplateId() : "");
            try {
                var template = templateService.getTemplate(campaign.getTemplateId());
                if (template != null) {
                    result.put("category", template.getCategory() != null ? template.getCategory() : "");
                    result.put("senderEmail", template.getSenderEmail() != null ? template.getSenderEmail() : "");
                    result.put("name", template.getName() != null ? template.getName() : "");
                    result.put("landingBrand", template.getLandingBrand() != null ? template.getLandingBrand() : "");
                    result.put("landingLogoUrl", template.getLandingLogoUrl() != null ? template.getLandingLogoUrl() : "");
                    result.put("landingPrimaryColor", template.getLandingPrimaryColor() != null ? template.getLandingPrimaryColor() : "");
                    result.put("landingBgColor", template.getLandingBgColor() != null ? template.getLandingBgColor() : "");
                }
            } catch (Exception e) {
                // Fallback — just use campaign-level data
            }
        }
        return result;
    }
}
