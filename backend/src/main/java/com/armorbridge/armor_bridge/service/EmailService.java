package com.armorbridge.armor_bridge.service;

import com.armorbridge.armor_bridge.model.Campaign;
import com.armorbridge.armor_bridge.model.Employee;
import com.armorbridge.armor_bridge.model.PhishingTemplate;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Email Simulation Engine — sends templated phishing emails to target employees.
 * 
 * Key safety rules:
 * - Emails are simulated phishing for training purposes only
 * - Tracking links point to the platform's phishing landing page
 * - No real malware or dangerous payloads are ever sent
 * - Credential capture on landing page only records a boolean flag, never actual passwords
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TemplateService templateService;

    @Autowired
    private TrackingService trackingService;

    @Autowired
    private CampaignService campaignService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${armorbridge.platform.base-url}")
    private String platformBaseUrl;

    // Track campaign send progress: campaignId -> { sent, total, failed, status }
    private final ConcurrentHashMap<String, Map<String, Object>> sendProgress = new ConcurrentHashMap<>();

    /**
     * Get the current send progress for a campaign.
     */
    public Map<String, Object> getSendProgress(String campaignId) {
        return sendProgress.getOrDefault(campaignId, Map.of(
            "sent", 0, "total", 0, "failed", 0, "status", "unknown"
        ));
    }

    /**
     * Launch a campaign — sends phishing simulation emails to all target employees.
     * Runs asynchronously so the API call returns immediately.
     */
    @Async
    public void launchCampaign(String campaignId) {
        try {
            // Use injected service properly
            Campaign campaign = findCampaignById(campaignId);
            if (campaign == null) {
                System.err.println("❌ Campaign not found: " + campaignId);
                return;
            }

            // 2. Load the phishing template
            PhishingTemplate template = findTemplateById(campaign.getTemplateId());
            if (template == null) {
                System.err.println("❌ Template not found: " + campaign.getTemplateId());
                return;
            }

            // 3. Get target employees
            List<Employee> allEmployees = employeeService.getAllEmployees();
            List<Employee> targets;
            
            if (campaign.getTargetEmployeeIds() != null && !campaign.getTargetEmployeeIds().isEmpty()) {
                targets = allEmployees.stream()
                    .filter(e -> campaign.getTargetEmployeeIds().contains(e.getId()))
                    .filter(e -> "active".equals(e.getStatus()))
                    .toList();
            } else if (campaign.getTargetDepartments() != null && !campaign.getTargetDepartments().isEmpty()) {
                targets = allEmployees.stream()
                    .filter(e -> campaign.getTargetDepartments().contains(e.getDepartment()))
                    .filter(e -> "active".equals(e.getStatus()))
                    .toList();
            } else {
                System.err.println("❌ No target employees or departments specified for campaign: " + campaignId);
                return;
            }

            // 4. Initialize progress tracking
            Map<String, Object> progress = new ConcurrentHashMap<>();
            progress.put("sent", 0);
            progress.put("total", targets.size());
            progress.put("failed", 0);
            progress.put("status", "sending");
            sendProgress.put(campaignId, progress);

            System.out.println("📧 Launching campaign '" + campaign.getName() + "' → " + targets.size() + " employees");

            // 5. Send emails to each target
            int sent = 0;
            int failed = 0;

            for (Employee emp : targets) {
                try {
                    sendPhishingEmail(campaignId, emp, template);
                    sent++;
                    
                    // Log delivery event
                    com.armorbridge.armor_bridge.model.TrackingEvent deliveryEvent = new com.armorbridge.armor_bridge.model.TrackingEvent();
                    deliveryEvent.setCampaignId(campaignId);
                    deliveryEvent.setEmployeeId(emp.getId());
                    deliveryEvent.setEmployeeEmail(emp.getEmail());
                    deliveryEvent.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
                    deliveryEvent.setDepartment(emp.getDepartment());
                    deliveryEvent.setEventType("email_delivered");
                    deliveryEvent.setCredentialAttempted(false);
                    deliveryEvent.setTimestamp(System.currentTimeMillis());
                    trackingService.logEvent(deliveryEvent);
                    
                } catch (Exception e) {
                    failed++;
                    System.err.println("⚠️ Failed to send to " + emp.getEmail() + ": " + e.getMessage());
                }

                // Update progress
                progress.put("sent", sent);
                progress.put("failed", failed);

                // Small delay to avoid SMTP rate limiting
                Thread.sleep(200);
            }

            // 6. Mark campaign as complete
            progress.put("status", "completed");
            System.out.println("✅ Campaign '" + campaign.getName() + "' completed: " + sent + " sent, " + failed + " failed");

        } catch (Exception e) {
            System.err.println("❌ Campaign launch failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> progress = sendProgress.get(campaignId);
            if (progress != null) {
                progress.put("status", "failed");
            }
        }
    }

    /**
     * Send a single phishing simulation email to an employee.
     */
    private void sendPhishingEmail(String campaignId, Employee employee, PhishingTemplate template) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // Set email headers
        try {
            helper.setFrom(fromEmail, template.getSenderName() != null ? template.getSenderName() : "IT Security Team");
        } catch (java.io.UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(employee.getEmail());
        helper.setSubject(template.getSubject());

        // Build the phishing link (points to the frontend's phishing landing page)
        String phishingLink = platformBaseUrl + "/phish/" + campaignId + "/" + employee.getId();

        // Process the template body — replace placeholders
        String body = processTemplate(template.getBodyHtml(), employee, phishingLink);

        helper.setText(body, true); // true = HTML content

        // Add a custom header to identify simulation emails
        message.addHeader("X-Armor-Bridz-Simulation", "true");
        message.addHeader("X-Campaign-Id", campaignId);

        mailSender.send(message);
    }

    /**
     * Process template HTML — replace placeholders with employee-specific data.
     * 
     * Supported placeholders:
     *   {{EMPLOYEE_NAME}}    → Employee's full name
     *   {{EMPLOYEE_FIRST}}   → First name
     *   {{EMPLOYEE_EMAIL}}   → Email address
     *   {{DEPARTMENT}}       → Department
     *   {{PHISHING_LINK}}    → The tracking/phishing URL
     *   {{COMPANY_NAME}}     → "Armor Bridz" 
     */
    private String processTemplate(String templateHtml, Employee employee, String phishingLink) {
        if (templateHtml == null) return "<p>Please click <a href=\"" + phishingLink + "\">here</a> to verify your account.</p>";

        String processed = templateHtml;
        processed = processed.replace("{{EMPLOYEE_NAME}}", employee.getFirstName() + " " + employee.getLastName());
        processed = processed.replace("{{EMPLOYEE_FIRST}}", employee.getFirstName());
        processed = processed.replace("{{EMPLOYEE_EMAIL}}", employee.getEmail());
        processed = processed.replace("{{DEPARTMENT}}", employee.getDepartment() != null ? employee.getDepartment() : "");
        processed = processed.replace("{{PHISHING_LINK}}", phishingLink);
        processed = processed.replace("{{TRACKING_LINK}}", phishingLink);
        processed = processed.replace("{{COMPANY_NAME}}", "Armor Bridz");

        // If the template doesn't contain a phishing link placeholder, append one
        if (!templateHtml.contains("{{PHISHING_LINK}}") && !templateHtml.contains(phishingLink)) {
            processed += "<br><br><p style=\"text-align:center;\"><a href=\"" + phishingLink 
                + "\" style=\"background:#1a73e8;color:#fff;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;\">"
                + "Verify Now</a></p>";
        }

        return processed;
    }

    /**
     * Find a campaign by ID from Firestore.
     */
    private Campaign findCampaignById(String campaignId) {
        try {
            return campaignService.getCampaign(campaignId);
        } catch (Exception e) {
            System.err.println("Failed to load campaign: " + e.getMessage());
        }
        return null;
    }

    /**
     * Find a template by ID from Firestore.
     */
    private PhishingTemplate findTemplateById(String templateId) {
        try {
            com.google.cloud.firestore.Firestore fs = com.google.firebase.cloud.FirestoreClient.getFirestore();
            var doc = fs.collection("templates").document(templateId).get().get();
            if (doc.exists()) {
                PhishingTemplate t = doc.toObject(PhishingTemplate.class);
                if (t != null) t.setId(doc.getId());
                return t;
            }
        } catch (Exception e) {
            System.err.println("Failed to load template: " + e.getMessage());
        }
        return null;
    }
}
