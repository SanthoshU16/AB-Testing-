package com.armorbridge.armor_bridge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhishingTemplate {
    private String id;
    private String name;
    private String subject;
    private String content; // HTML content
    private String senderName;
    private String category;
    private String type;
    private String difficulty;
}
