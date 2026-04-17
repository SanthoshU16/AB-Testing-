package com.armorbridge.armor_bridge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String role;
    private String status; // active, inactive
    private Integer riskScore;
}
