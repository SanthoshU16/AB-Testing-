package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.Campaign;
import com.armorbridge.armor_bridge.model.Employee;
import com.armorbridge.armor_bridge.service.CampaignService;
import com.armorbridge.armor_bridge.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private CampaignService campaignService;

    @GetMapping("/summary")
    public Map<String, Object> getSummary() throws ExecutionException, InterruptedException {
        List<Employee> emps = employeeService.getAllEmployees();
        List<Campaign> camps = campaignService.getAllCampaigns();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEmployees", emps.size());
        summary.put("activeCampaigns", camps.stream().filter(c -> "active".equals(c.getStatus())).count());
        
        long highRisk = emps.stream().filter(e -> e.getRiskScore() != null && e.getRiskScore() >= 70).count();
        summary.put("highRiskCount", highRisk);

        // Average Click Rate
        double avgClick = camps.stream()
                .filter(c -> c.getStats() != null && c.getStats().get("totalSent") != null && c.getStats().get("totalSent") > 0)
                .mapToDouble(c -> {
                    int sent = c.getStats().get("totalSent");
                    int clicked = c.getStats().getOrDefault("clicked", 0);
                    return (double) clicked / sent * 100;
                }).average().orElse(0.0);
        
        summary.put("avgClickRate", Math.round(avgClick));

        return summary;
    }
}
