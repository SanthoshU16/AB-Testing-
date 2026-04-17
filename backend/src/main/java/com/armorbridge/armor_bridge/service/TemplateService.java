package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.PhishingTemplate;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import jakarta.annotation.PostConstruct;

@Service
public class TemplateService {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION = "templates";

    @PostConstruct
    public void seedTemplates() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).limit(1).get();
        if (future.get().isEmpty()) {
            System.out.println("🌱 Seeding default phishing templates...");
            String[] names = {
                "Microsoft 365 Security Alert",
                "Google Workspace: New Sign-in",
                "Corporate Salary Update",
                "IT Department: Urgent Policy Change"
            };

            for (String name : names) {
                PhishingTemplate t = new PhishingTemplate();
                t.setName(name);
                t.setType("Email");
                t.setCategory("Credential Harvesting");
                t.setDifficulty("Medium");
                t.setSubject("Urgent Action Required");
                t.setContent("<p>Please review the attached document and update your details.</p>");
                saveTemplate(t);
            }
        }
    }

    public List<PhishingTemplate> getAllTemplates() throws ExecutionException, InterruptedException {
        List<PhishingTemplate> templates = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        for (QueryDocumentSnapshot document : future.get().getDocuments()) {
            PhishingTemplate template = document.toObject(PhishingTemplate.class);
            template.setId(document.getId());
            templates.add(template);
        }
        return templates;
    }

    public String saveTemplate(PhishingTemplate template) throws ExecutionException, InterruptedException {
        if (template.getId() != null) {
            firestore.collection(COLLECTION).document(template.getId()).set(template, SetOptions.merge());
            return template.getId();
        } else {
            ApiFuture<DocumentReference> future = firestore.collection(COLLECTION).add(template);
            return future.get().getId();
        }
    }

    public void deleteTemplate(String id) {
        firestore.collection(COLLECTION).document(id).delete();
    }
}
