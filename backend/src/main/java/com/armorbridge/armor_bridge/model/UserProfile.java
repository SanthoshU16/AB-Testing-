package com.armorbridge.armor_bridge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    private String uid;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Long createdAt;
    private Long updatedAt;
    private Long lastLogin;
    private String status; // active, suspended
}
