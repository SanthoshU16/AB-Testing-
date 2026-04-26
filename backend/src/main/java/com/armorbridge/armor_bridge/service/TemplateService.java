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
    public void seedTemplates() {
        try {
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
                    t.setCategory("password-reset");
                    t.setSubject("Urgent Action Required");
                    t.setSenderName("IT Support");
                    t.setSenderEmail("support@company.com");
                    t.setBodyHtml("<p>Please review the attached document and update your details.</p>");
                    t.setPreviewText("Urgent security notification");
                    t.setIsDefault(true);
                    t.setCreatedAt(System.currentTimeMillis());
                    t.setUpdatedAt(System.currentTimeMillis());
                    saveTemplate(t);
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Failed to seed templates during startup. Firestore might be unreachable.");
            e.printStackTrace();
        }
    }

    public List<PhishingTemplate> getAllTemplates() throws ExecutionException, InterruptedException {
        List<PhishingTemplate> templates = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        for (QueryDocumentSnapshot document : future.get().getDocuments()) {
            PhishingTemplate template = mapDocumentToTemplate(document);
            templates.add(template);
        }
        return templates;
    }

    public PhishingTemplate getTemplate(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
        if (doc.exists()) {
            return mapDocumentToTemplate(doc);
        }
        return null;
    }

    private PhishingTemplate mapDocumentToTemplate(DocumentSnapshot doc) {
        PhishingTemplate t = new PhishingTemplate();
        t.setId(doc.getId());
        t.setName(doc.getString("name"));
        t.setCategory(doc.getString("category"));
        t.setSubject(doc.getString("subject"));
        t.setSenderName(doc.getString("senderName"));
        
        // Fallback for senderEmail
        String email = doc.getString("senderEmail");
        if (email == null) email = doc.getString("sender_email");
        t.setSenderEmail(email);
        
        // Fallback for bodyHtml
        String body = doc.getString("bodyHtml");
        if (body == null) body = doc.getString("content");
        t.setBodyHtml(body);
        
        t.setPreviewText(doc.getString("previewText"));
        
        Boolean isDefault = doc.getBoolean("isDefault");
        t.setIsDefault(isDefault != null && isDefault);
        
        t.setCreatedAt(safeGetLong(doc, "createdAt"));
        t.setUpdatedAt(safeGetLong(doc, "updatedAt"));
        
        return t;
    }

    private long safeGetLong(DocumentSnapshot doc, String field) {
        Object val = doc.get(field);
        if (val instanceof Number) return ((Number) val).longValue();
        if (val instanceof com.google.cloud.Timestamp) return ((com.google.cloud.Timestamp) val).toSqlTimestamp().getTime();
        return 0L;
    }

    public String saveTemplate(PhishingTemplate template) throws ExecutionException, InterruptedException {
        long now = System.currentTimeMillis();
        template.setUpdatedAt(now);
        
        // Remove ID from the data body before saving to avoid redundant field if desired,
        // but we'll keep it for simplicity as long as it matches the document ID.
        String id = template.getId();
        
        if (id != null && !id.trim().isEmpty()) {
            firestore.collection(COLLECTION).document(id).set(template, SetOptions.merge()).get();
            return id;
        } else {
            if (template.getCreatedAt() == null || template.getCreatedAt() == 0L) {
                template.setCreatedAt(now);
            }
            ApiFuture<DocumentReference> future = firestore.collection(COLLECTION).add(template);
            return future.get().getId();
        }
    }

    public void deleteTemplate(String id) {
        firestore.collection(COLLECTION).document(id).delete();
    }
}
