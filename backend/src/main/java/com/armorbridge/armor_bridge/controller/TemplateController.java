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

    @GetMapping("/{id}")
    public PhishingTemplate getTemplate(@PathVariable String id) throws ExecutionException, InterruptedException {
        return templateService.getTemplate(id);
    }

    @PostMapping
    public String saveTemplate(@RequestBody PhishingTemplate template) {
        try {
            return templateService.saveTemplate(template);
        } catch (Exception e) {
            try {
                java.io.FileWriter fw = new java.io.FileWriter("error.log", true);
                java.io.PrintWriter pw = new java.io.PrintWriter(fw);
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            throw new RuntimeException("Failed to save template: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
    }

    @PostMapping("/reseed")
    public String reseedDefaults() {
        try {
            // Delete all existing default templates
            List<PhishingTemplate> all = templateService.getAllTemplates();
            for (PhishingTemplate t : all) {
                if (Boolean.TRUE.equals(t.getIsDefault()) && t.getId() != null) {
                    templateService.deleteTemplate(t.getId());
                }
            }
            // Re-run seeder forcefully
            templateService.seedTemplates(true);
            return "Reseeded successfully";
        } catch (Exception e) {
            throw new RuntimeException("Failed to reseed: " + e.getMessage(), e);
        }
    }
}

@org.springframework.web.bind.annotation.RestControllerAdvice
class GlobalExceptionHandler {
    @org.springframework.web.bind.annotation.ExceptionHandler(Exception.class)
    public org.springframework.http.ResponseEntity<String> handleException(Exception e) {
        try {
            java.io.FileWriter fw = new java.io.FileWriter("global_error.log", true);
            java.io.PrintWriter pw = new java.io.PrintWriter(fw);
            pw.println("=== ERROR ===");
            e.printStackTrace(pw);
            pw.close();
        } catch (Exception ex) {}
        
        return org.springframework.http.ResponseEntity
            .status(org.springframework.http.HttpStatus.BAD_REQUEST)
            .body("Error: " + e.getMessage());
    }
}
