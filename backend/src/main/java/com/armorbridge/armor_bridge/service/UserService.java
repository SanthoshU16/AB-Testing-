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
            UserProfile profile = new UserProfile();
            profile.setUid(document.getId());
            profile.setEmail(document.getString("email"));
            profile.setFirstName(document.getString("firstName"));
            profile.setLastName(document.getString("lastName"));
            profile.setRole(document.getString("role"));
            profile.setStatus(document.getString("status"));
            
            // Safe timestamp conversion
            profile.setCreatedAt(safeGetLong(document, "createdAt"));
            profile.setUpdatedAt(safeGetLong(document, "updatedAt"));
            profile.setLastLogin(safeGetLong(document, "lastLogin"));
            
            return profile;
        }
        return null;
    }

    private Long safeGetLong(DocumentSnapshot doc, String field) {
        Object val = doc.get(field);
        if (val instanceof Number) return ((Number) val).longValue();
        if (val instanceof com.google.cloud.Timestamp) return ((com.google.cloud.Timestamp) val).toSqlTimestamp().getTime();
        return null;
    }

    public void saveUserProfile(UserProfile profile) {
        long now = System.currentTimeMillis();
        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(now);
        }
        profile.setUpdatedAt(now);
        firestore.collection(COLLECTION).document(profile.getUid()).set(profile, SetOptions.merge());
    }

    public void updateLastLogin(String uid) {
        firestore.collection(COLLECTION).document(uid).update("lastLogin", System.currentTimeMillis());
    }

    public void deleteUserAccount(String uid) throws com.google.firebase.auth.FirebaseAuthException, ExecutionException, InterruptedException {
        // Delete from Firestore
        firestore.collection(COLLECTION).document(uid).delete().get();
        // Delete from Firebase Auth
        com.google.firebase.auth.FirebaseAuth.getInstance().deleteUser(uid);
    }
}
