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
        seedTemplates(false);
    }

    public void seedTemplates(boolean force) {
        try {
            if (!force) {
                ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).whereEqualTo("isDefault", true).limit(1).get();
                if (!future.get().isEmpty()) return;
            }

            System.out.println("🌱 Seeding 20 default phishing templates...");
            long now = System.currentTimeMillis();

            seedOne(now, "Microsoft 365 Security Alert", "password-reset",
                "Unusual sign-in activity on your account", "Microsoft Security", "security@microsoft-alerts.com",
                "Microsoft", "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
                "#0078d4", "#f2f2f2",
                "We detected unusual sign-in activity on your account <strong>{{EMPLOYEE_EMAIL}}</strong>. Please verify your identity to restore full access.",
                "Verify My Identity");

            seedOne(now, "Google Workspace Sign-in Alert", "login-alert",
                "New sign-in from unknown device", "Google Security", "no-reply@accounts-google.com",
                "Google", "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
                "#4285f4", "#f8f9fa",
                "A new sign-in was detected on your account <strong>{{EMPLOYEE_EMAIL}}</strong> from an unrecognized device. If this wasn't you, secure your account immediately.",
                "Review Activity");

            seedOne(now, "LinkedIn Profile Views", "custom",
                "{{EMPLOYEE_NAME}}, people are looking at your profile", "LinkedIn", "linkedin@linkedin-notifications.com",
                "LinkedIn", "https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg",
                "#0a66c2", "#f3f2ef",
                "You had <strong>12 new profile views</strong> in the last week. See who's been looking at your profile and connect with them.",
                "See who viewed your profile");

            seedOne(now, "Dropbox Shared File", "delivery",
                "Someone shared a file with you", "Dropbox", "no-reply@dropbox-share.com",
                "Dropbox", "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg",
                "#0061fe", "#f7f5f2",
                "A colleague has shared the file <strong>Q4_Financial_Report.xlsx</strong> with you. Click below to view and download the document.",
                "View File");

            seedOne(now, "Corporate Salary Revision", "hr-policy",
                "Important: Your salary revision details", "HR Department", "hr@company-internal.com",
                "HR Portal", "", "#16a34a", "#f0fdf4",
                "Dear {{EMPLOYEE_NAME}},<br><br>Your annual salary revision has been processed. Please log in to the HR portal to view and acknowledge your updated compensation package before the deadline.",
                "View My Revision");

            seedOne(now, "Slack Workspace Invitation", "custom",
                "You've been invited to a Slack workspace", "Slack", "feedback@slack-notify.com",
                "Slack", "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
                "#611f69", "#f4ede4",
                "{{EMPLOYEE_NAME}}, you've been invited to join the <strong>Project Alpha</strong> workspace on Slack. Accept the invitation to start collaborating with your team.",
                "Accept Invitation");

            seedOne(now, "IT VPN Access Expiring", "vpn",
                "Action Required: VPN access expires in 24 hours", "IT Support", "it-support@company-vpn.com",
                "IT Security", "", "#dc2626", "#fef2f2",
                "Your corporate VPN access for <strong>{{EMPLOYEE_EMAIL}}</strong> is set to expire in 24 hours. Please re-authenticate to maintain uninterrupted access to company resources.",
                "Renew VPN Access");

            seedOne(now, "DocuSign Document Pending", "delivery",
                "Complete your pending document signature", "DocuSign", "dse@docusign-mail.com",
                "DocuSign", "https://www.vectorlogo.zone/logos/docusign/docusign-icon.svg",
                "#4c00c7", "#f5f5f5",
                "{{EMPLOYEE_NAME}}, you have a document awaiting your signature: <strong>Employment Agreement - Updated Terms</strong>. Please review and sign before the deadline.",
                "Review Document");

            seedOne(now, "AWS Account Alert", "login-alert",
                "AWS Root Account: Suspicious API call detected", "Amazon Web Services", "no-reply@aws-alerts.com",
                "AWS", "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
                "#ff9900", "#f2f3f3",
                "A suspicious API call was detected from your AWS root account <strong>{{EMPLOYEE_EMAIL}}</strong>. We recommend verifying your recent activity immediately.",
                "Review Account Activity");

            seedOne(now, "Zoom Meeting Recording", "custom",
                "Your meeting recording is ready", "Zoom", "no-reply@zoom-cloud.com",
                "Zoom", "https://upload.wikimedia.org/wikipedia/commons/1/11/Zoom_Logo_2022.svg",
                "#2d8cff", "#f6f6f6",
                "Hi {{EMPLOYEE_NAME}},<br><br>The cloud recording for <strong>Weekly Team Standup</strong> is now available. Click below to view or download the recording before it expires in 7 days.",
                "View Recording");

            // --- 10 NEW TEMPLATES ---

            seedOne(now, "Apple ID Locked", "password-reset",
                "Your Apple ID has been locked for security reasons", "Apple Support", "appleid@id.apple.com",
                "Apple", "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                "#000000", "#f5f5f7",
                "Dear {{EMPLOYEE_NAME}},<br><br>We recently noticed unusual activity on your Apple ID. To protect your account, it has been temporarily locked. Please verify your identity to unlock your account.",
                "Unlock Apple ID");

            seedOne(now, "Meta Business Policy Violation", "hr-policy",
                "Action Required: Policy Violation Detected on Meta Business", "Meta Support", "support@business.facebook.com",
                "Meta", "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
                "#0668E1", "#f0f2f5",
                "A recent post or advertisement on your Meta Business account violates our community standards. Please review the flagged content to avoid account suspension.",
                "Review Violation");

            seedOne(now, "Netflix Payment Failed", "delivery",
                "Payment declined - update your details", "Netflix", "info@mailer.netflix.com",
                "Netflix", "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
                "#E50914", "#000000",
                "Hi {{EMPLOYEE_NAME}},<br><br>We couldn't process your payment for the next billing cycle. Please update your payment information to continue enjoying Netflix.",
                "Update Payment Info");

            seedOne(now, "PayPal Security Alert", "login-alert",
                "New login to your PayPal account", "PayPal Security", "service@paypal.com",
                "PayPal", "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
                "#003087", "#f5f7fa",
                "We noticed a login to your PayPal account from a new device in <strong>London, UK</strong>. If this wasn't you, please secure your account right away.",
                "Secure My Account");

            seedOne(now, "Amazon Order Confirmation", "delivery",
                "Your Amazon order has shipped!", "Amazon.com", "auto-confirm@amazon.com",
                "Amazon", "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
                "#FF9900", "#ffffff",
                "Hello {{EMPLOYEE_NAME}},<br><br>Your order #113-847293-849204 has shipped! Click the button below to track your package or view your order details.",
                "Track Package");

            seedOne(now, "GitHub Dependabot Alert", "vpn",
                "[Action Required] Critical vulnerability detected", "GitHub", "notifications@github.com",
                "GitHub", "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
                "#24292e", "#f6f8fa",
                "A critical security vulnerability has been detected in one of your repository dependencies. Please review the security advisory and update your packages immediately.",
                "Review Advisory");

            seedOne(now, "Spotify Premium Renewal", "delivery",
                "Your Premium receipt", "Spotify", "no-reply@spotify.com",
                "Spotify", "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
                "#1DB954", "#121212",
                "Thanks for choosing Spotify Premium. Your subscription has been automatically renewed. Check your receipt details below.",
                "View Receipt");

            seedOne(now, "Salesforce Password Expiration", "password-reset",
                "Your Salesforce password expires in 3 days", "Salesforce", "noreply@salesforce.com",
                "Salesforce", "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
                "#00A1E0", "#f4f6f9",
                "Hi {{EMPLOYEE_NAME}},<br><br>Your Salesforce login password is set to expire in 3 days. Please update your password to maintain access to your CRM portal.",
                "Reset Password");

            seedOne(now, "Atlassian Jira Issue Mention", "custom",
                "You have been mentioned in Jira: PROJ-842", "Jira", "jira@atlassian-mail.com",
                "Atlassian", "https://upload.wikimedia.org/wikipedia/commons/8/8a/Jira_Logo.svg",
                "#0052CC", "#fafbfc",
                "You were mentioned in a comment on issue <strong>PROJ-842: Fix authentication bug</strong>. Please review the comment and provide your feedback.",
                "View Issue in Jira");

            seedOne(now, "Twitter/X Login Code", "login-alert",
                "Your Twitter verification code", "Twitter/X", "verify@twitter.com",
                "X", "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
                "#000000", "#ffffff",
                "Someone is trying to log into your X (formerly Twitter) account. If this was you, please use the following verification code to complete the login process.<br><br><strong>849201</strong>",
                "Review Login Info");

            System.out.println("✅ Seeded 20 default templates");
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Failed to seed templates: " + e.getMessage());
        }
    }

    private void seedOne(long now, String name, String category, String subject,
                         String senderName, String senderEmail, String brand, String logoUrl,
                         String primaryColor, String bgColor, String message, String btnText) {
        try {
            String bodyHtml = buildEmail(logoUrl, primaryColor, brand, message, btnText, "{{TRACKING_LINK}}");
            PhishingTemplate t = new PhishingTemplate();
            t.setName(name);
            t.setCategory(category);
            t.setSubject(subject);
            t.setSenderName(senderName);
            t.setSenderEmail(senderEmail);
            t.setBodyHtml(bodyHtml);
            t.setPreviewText(subject);
            t.setIsDefault(true);
            t.setCreatedAt(now);
            t.setUpdatedAt(now);
            t.setLandingBrand(brand);
            t.setLandingLogoUrl(logoUrl);
            t.setLandingPrimaryColor(primaryColor);
            t.setLandingBgColor(bgColor);
            saveTemplate(t);
        } catch (Exception e) {
            System.err.println("Failed to seed template '" + name + "': " + e.getMessage());
        }
    }

    private String buildEmail(String logoUrl, String color, String brand, String message, String btnText, String link) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
            + "<body style='margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;'>"
            + "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f9f9f9;padding:40px 0;'>"
            + "<tr><td align='center'>"
            + "<table width='100%' max-width='600' cellpadding='0' cellspacing='0' style='max-width:600px;background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;'>"
            + "<tr><td style='padding:32px 32px 20px 32px;text-align:center;border-bottom:1px solid #f0f0f0;'>"
            + (logoUrl != null && !logoUrl.isEmpty() ? "<img src='" + logoUrl + "' alt='" + brand + "' height='40' style='max-height:40px;width:auto;display:inline-block;' />" : "<h1 style='color:" + color + ";margin:0;font-size:24px;'>" + brand + "</h1>")
            + "</td></tr>"
            + "<tr><td style='padding:32px;'>"
            + "<h2 style='margin:0 0 20px;font-size:20px;font-weight:600;color:#111111;'>" + brand + " Notification</h2>"
            + "<p style='font-size:16px;color:#333333;line-height:1.6;margin:0 0 24px;'>" + message + "</p>"
            + "<table cellpadding='0' cellspacing='0' width='100%'><tr><td align='center'>"
            + "<a href=\"" + link + "\" style=\"display:inline-block;background:" + color + ";color:#ffffff;"
            + "padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;text-align:center;\">" + btnText + "</a>"
            + "</td></tr></table>"
            + "<p style='font-size:14px;color:#666666;line-height:1.5;margin:32px 0 0;padding-top:24px;border-top:1px solid #eeeeee;'>If you did not initiate this request, you can safely ignore this email or contact support if you have concerns.</p>"
            + "</td></tr>"
            + "<tr><td style='background:#fafafa;padding:24px 32px;border-top:1px solid #eeeeee;text-align:center;'>"
            + "<p style='font-size:12px;color:#999999;margin:0;'>This message was sent to {{EMPLOYEE_EMAIL}}.</p>"
            + "<p style='font-size:12px;color:#999999;margin:8px 0 0;'>&copy; " + java.time.Year.now().getValue() + " " + brand + " Inc. All rights reserved.</p>"
            + "</td></tr></table></td></tr></table></body></html>";
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

        // Landing page customization
        t.setLandingBrand(doc.getString("landingBrand"));
        t.setLandingLogoUrl(doc.getString("landingLogoUrl"));
        t.setLandingPrimaryColor(doc.getString("landingPrimaryColor"));
        t.setLandingBgColor(doc.getString("landingBgColor"));

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
