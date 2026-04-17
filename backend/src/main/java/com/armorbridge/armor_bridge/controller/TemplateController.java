package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.PhishingTemplate;
import com.armorbridge.armor_bridge.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @Autowired
    private TemplateService templateService;

    @GetMapping
    public List<PhishingTemplate> getTemplates() throws ExecutionException, InterruptedException {
        return templateService.getAllTemplates();
    }

    @PostMapping
    public String saveTemplate(@RequestBody PhishingTemplate template) throws ExecutionException, InterruptedException {
        return templateService.saveTemplate(template);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
    }
}
