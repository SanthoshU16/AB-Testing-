package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.UserProfile;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION = "users";

    public UserProfile getUserProfile(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION).document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            UserProfile profile = document.toObject(UserProfile.class);
            profile.setUid(document.getId());
            return profile;
        }
        return null;
    }

    public void saveUserProfile(UserProfile profile) {
        firestore.collection(COLLECTION).document(profile.getUid()).set(profile, SetOptions.merge());
    }

    public void updateLastLogin(String uid) {
        firestore.collection(COLLECTION).document(uid).update("lastLogin", FieldValue.serverTimestamp());
    }
}
