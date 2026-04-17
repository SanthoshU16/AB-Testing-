import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import java.io.FileInputStream;
import java.util.HashMap;
import java.util.Map;

public class SeedTemplates {
    public static void main(String[] args) throws Exception {
        FileInputStream serviceAccount = new FileInputStream("backend/src/main/resources/firebase-service-account.json");

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        FirebaseApp.initializeApp(options);
        Firestore db = FirestoreClient.getFirestore();

        String[] templates = {
            "Microsoft 365 Password Reset",
            "Google Security Alert",
            "Corporate IT Policy Update",
            "Shared Document Notification"
        };

        for (String name : templates) {
            Map<String, Object> data = new HashMap<>();
            data.add("name", name);
            data.add("type", "Email");
            data.add("difficulty", "Medium");
            data.add("category", "Credential Harvesting");
            data.add("subject", "Urgent: Action Required");
            data.add("content", "<h1>Attention</h1><p>Please update your password.</p>");
            
            db.collection("templates").add(data);
            System.out.println("Seeded template: " + name);
        }
    }
}
