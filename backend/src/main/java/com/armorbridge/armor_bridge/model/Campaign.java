package com.armorbridge.armor_bridge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Campaign {
    private String id;
    private String name;
    private String description;
    private String templateId;
    private String templateName;
    private List<String> targetEmployeeIds;
    private List<String> targetDepartments;
    private String status; // draft, scheduled, active, completed
    private Long scheduledAt; // Timestamp in millis
    private Long createdAt;
    private Long updatedAt;
    private String createdBy;
    private Map<String, Integer> stats;
}
