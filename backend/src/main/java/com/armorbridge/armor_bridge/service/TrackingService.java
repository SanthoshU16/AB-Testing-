package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.TrackingEvent;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class TrackingService {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION = "tracking_events";

    public List<TrackingEvent> getAllEvents() throws ExecutionException, InterruptedException {
        List<TrackingEvent> events = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
        for (QueryDocumentSnapshot document : future.get().getDocuments()) {
            TrackingEvent event = document.toObject(TrackingEvent.class);
            event.setId(document.getId());
            events.add(event);
        }
        return events;
    }

    public List<TrackingEvent> getEventsByCampaign(String campaignId) throws ExecutionException, InterruptedException {
        List<TrackingEvent> events = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION)
                .whereEqualTo("campaignId", campaignId)
                .get();
        for (QueryDocumentSnapshot document : future.get().getDocuments()) {
            TrackingEvent event = document.toObject(TrackingEvent.class);
            event.setId(document.getId());
            events.add(event);
        }
        return events;
    }

    public String logEvent(TrackingEvent event) throws ExecutionException, InterruptedException {
        if (event.getTimestamp() == null) {
            event.setTimestamp(System.currentTimeMillis());
        }
        ApiFuture<DocumentReference> future = firestore.collection(COLLECTION).add(event);
        
        // Update campaign stats summary
        updateCampaignStats(event.getCampaignId(), event.getEventType());
        
        return future.get().getId();
    }

    private void updateCampaignStats(String campaignId, String eventType) {
        DocumentReference campRef = firestore.collection("campaigns").document(campaignId);
        String field = "stats." + eventType;
        if (eventType.equals("credential_attempt")) field = "stats.credentialAttempts";
        else if (eventType.equals("link_clicked")) field = "stats.clicked";
        else if (eventType.equals("email_opened")) field = "stats.opened";
        else if (eventType.equals("email_delivered")) field = "stats.totalSent";

        campRef.update(field, FieldValue.increment(1));
    }
}
