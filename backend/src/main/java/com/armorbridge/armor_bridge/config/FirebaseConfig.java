package com.armorbridge.armor_bridge.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Value("${armorbridge.firebase.config-path}")
    private Resource firebaseConfig;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        String serviceAccountJson = System.getenv("FIREBASE_SERVICE_ACCOUNT");
        GoogleCredentials credentials;

        if (serviceAccountJson != null && !serviceAccountJson.isEmpty()) {
            credentials = GoogleCredentials.fromStream(new java.io.ByteArrayInputStream(serviceAccountJson.getBytes()));
        } else {
            credentials = GoogleCredentials.fromStream(firebaseConfig.getInputStream());
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();
        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public Firestore getFirestore(FirebaseApp firebaseApp) {
        return FirestoreClient.getFirestore();
    }
}
