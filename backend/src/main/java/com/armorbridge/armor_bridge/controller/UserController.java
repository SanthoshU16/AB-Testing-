package com.armorbridge.armor_bridge.controller;

import com.armorbridge.armor_bridge.model.UserProfile;
import com.armorbridge.armor_bridge.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public UserProfile getCurrentUser(Authentication auth) throws ExecutionException, InterruptedException {
        String uid = (String) auth.getPrincipal();
        return userService.getUserProfile(uid);
    }

    @PostMapping("/sync")
    public void syncUserProfile(@RequestBody UserProfile profile, Authentication auth) {
        // Ensure the UID matches the authenticated user
        profile.setUid((String) auth.getPrincipal());
        userService.saveUserProfile(profile);
    }

    @PostMapping("/login-event")
    public void recordLogin(Authentication auth) {
        userService.updateLastLogin((String) auth.getPrincipal());
    }

    @DeleteMapping("/me")
    public void deleteAccount(Authentication auth) throws com.google.firebase.auth.FirebaseAuthException, ExecutionException, InterruptedException {
        String uid = (String) auth.getPrincipal();
        userService.deleteUserAccount(uid);
    }
}
