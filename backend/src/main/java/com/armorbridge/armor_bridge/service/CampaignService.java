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

    public String createCampaign(Campaign campaign) throws ExecutionException, InterruptedException {
        ApiFuture<DocumentReference> future = firestore.collection(COLLECTION).add(campaign);
        return future.get().getId();
    }

    public void updateCampaign(String id, Campaign campaign) {
        firestore.collection(COLLECTION).document(id).set(campaign, SetOptions.merge());
    }
}
