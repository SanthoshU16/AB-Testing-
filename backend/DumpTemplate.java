import com.google.cloud.firestore.*;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

public class DumpTemplate {
    public static void main(String[] args) throws Exception {
        java.io.FileInputStream serviceAccount = new java.io.FileInputStream("src/main/resources/serviceAccountKey.json");
        FirebaseOptions options = new FirebaseOptions.Builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();
        FirebaseApp.initializeApp(options);
        Firestore db = FirestoreClient.getFirestore();
        for (QueryDocumentSnapshot doc : db.collection("templates").limit(1).get().get().getDocuments()) {
            System.out.println(doc.getData().keySet());
        }
    }
}
