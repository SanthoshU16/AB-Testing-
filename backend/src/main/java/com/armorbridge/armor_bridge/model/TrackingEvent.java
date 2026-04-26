package com.armorbridge.armor_bridge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingEvent {
    private String id;
    private String campaignId;
    private String employeeId;
    private String employeeEmail;
    private String employeeName;
    private String department;
    private String eventType; // email_delivered, email_opened, link_clicked, credential_attempt
    private Long timestamp;
    private Boolean credentialAttempted;
    private String ipAddress;
    private String userAgent;
    private String browser;
    private String os;
    private String device;
    private String location;
}
