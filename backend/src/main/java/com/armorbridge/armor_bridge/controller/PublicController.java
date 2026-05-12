package com.armorbridge.armor_bridge.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/")
    public String healthCheck() {
        return "Armor Bridge API is running!";
    }
}
