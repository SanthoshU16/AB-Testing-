package com.armorbridge.armor_bridge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.google.cloud.firestore.annotation.IgnoreExtraProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgnoreExtraProperties
@JsonIgnoreProperties(ignoreUnknown = true)
public class PhishingTemplate {
    private String id;
    private String name;
    private String category;
    private String subject;
    private String senderName;
    private String senderEmail;
    private String bodyHtml;
    private String previewText;
    private Boolean isDefault;
    private Long createdAt;
    private Long updatedAt;
    // Landing page customization
    private String landingBrand;
    private String landingLogoUrl;
    private String landingPrimaryColor;
    private String landingBgColor;
}
