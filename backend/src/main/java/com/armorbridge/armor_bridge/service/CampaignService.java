package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.Campaign;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class CampaignService {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION = "campaigns";

    public List<Campaign> getAllCampaigns() throws ExecutionException, InterruptedException {
        List<Campaign> campaigns = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        for (QueryDocumentSnapshot document : future.get().getDocuments()) {
            Campaign campaign = document.toObject(Campaign.class);
            campaign.setId(document.getId());
            campaigns.add(campaign);
        }
        return campaigns;
    }

    public List<Campaign> getPendingScheduledCampaigns(long now) throws ExecutionException, InterruptedException {
        List<Campaign> campaigns = new ArrayList<>();
        // Query only for 'scheduled' campaigns where scheduledAt <= now
        Query query = firestore.collection(COLLECTION)
                .whereEqualTo("status", "scheduled")
                .whereLessThanOrEqualTo("scheduledAt", now);
        
        ApiFuture<QuerySnapshot> future = query.get();
        for (QueryDocumentSnapshot document : future.get().getDocuments()) {
            Campaign campaign = document.toObject(Campaign.class);
            campaign.setId(document.getId());
            campaigns.add(campaign);
        }
        return campaigns;
    }

    public String createCampaign(Campaign campaign) throws ExecutionException, InterruptedException {
        long now = System.currentTimeMillis();
        campaign.setCreatedAt(now);
        campaign.setUpdatedAt(now);
        ApiFuture<DocumentReference> future = firestore.collection(COLLECTION).add(campaign);
        return future.get().getId();
    }

    public Campaign getCampaign(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
        if (doc.exists()) {
            Campaign campaign = doc.toObject(Campaign.class);
            if (campaign != null) campaign.setId(doc.getId());
            return campaign;
        }
        return null;
    }

    public void updateCampaign(String id, java.util.Map<String, Object> updates) throws ExecutionException, InterruptedException {
        updates.put("updatedAt", System.currentTimeMillis());
        firestore.collection(COLLECTION).document(id).set(updates, SetOptions.merge()).get();
    }

    public void deleteCampaign(String id) throws ExecutionException, InterruptedException {
        firestore.collection(COLLECTION).document(id).delete().get();
    }

    public void deleteAllCampaigns() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        WriteBatch batch = firestore.batch();
        for (QueryDocumentSnapshot document : documents) {
            batch.delete(document.getReference());
        }
        batch.commit().get();
    }
}
