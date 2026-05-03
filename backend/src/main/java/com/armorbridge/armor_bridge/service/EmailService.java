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

    @Value("${armorbridge.platform.backend-url:http://localhost:8080}")
    private String backendUrl;

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

        // Build the pixel tracking link
        String pixelLink = backendUrl + "/api/tracking/pixel/" + campaignId + "/" + employee.getId();

        // Process the template body — replace placeholders
        String body = processTemplate(template.getBodyHtml(), employee, phishingLink, pixelLink);

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
    private String processTemplate(String templateHtml, Employee employee, String phishingLink, String pixelLink) {
        // If the template body is null or essentially empty, use a realistic default
        if (templateHtml == null || templateHtml.trim().isEmpty() || templateHtml.trim().length() < 30) {
            return buildRealisticFallbackEmail(employee, phishingLink, pixelLink);
        }

        String processed = templateHtml;
        processed = processed.replace("{{EMPLOYEE_NAME}}", employee.getFirstName() + " " + employee.getLastName());
        processed = processed.replace("{{EMPLOYEE_FIRST}}", employee.getFirstName());
        processed = processed.replace("{{EMPLOYEE_EMAIL}}", employee.getEmail());
        processed = processed.replace("{{DEPARTMENT}}", employee.getDepartment() != null ? employee.getDepartment() : "");
        processed = processed.replace("{{PHISHING_LINK}}", phishingLink);
        processed = processed.replace("{{TRACKING_LINK}}", phishingLink);
        processed = processed.replace("{{COMPANY_NAME}}", "Armor Bridz");

        // Append tracking pixel
        processed += "<img src=\"" + pixelLink + "\" width=\"1\" height=\"1\" style=\"display:none;\" />";

        return processed;
    }

    /**
     * Build a realistic Microsoft 365 styled phishing email when the template body is empty/null.
     */
    private String buildRealisticFallbackEmail(Employee employee, String phishingLink, String pixelLink) {
        String firstName = employee.getFirstName();
        String email = employee.getEmail();

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
            + "<body style='margin:0;padding:0;background:#f4f4f4;font-family:Segoe UI,Helvetica,Arial,sans-serif;'>"
            + "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f4;padding:40px 0;'>"
            + "<tr><td align='center'>"
            + "<table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:4px;"
            + "box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;'>"

            // Header bar
            + "<tr><td style='background:#0078d4;padding:20px 32px;'>"
            + "<table width='100%'><tr>"
            + "<td style='color:#ffffff;font-size:18px;font-weight:600;'>Microsoft 365</td>"
            + "<td align='right' style='color:rgba(255,255,255,0.7);font-size:12px;'>Security Alert</td>"
            + "</tr></table>"
            + "</td></tr>"

            // Body
            + "<tr><td style='padding:32px 32px 24px;'>"
            + "<p style='font-size:15px;color:#242424;line-height:1.6;margin:0 0 16px;'>"
            + "Dear " + firstName + ",</p>"

            + "<p style='font-size:15px;color:#242424;line-height:1.6;margin:0 0 16px;'>"
            + "We detected unusual sign-in activity on your account <strong>" + email + "</strong>. "
            + "As a security precaution, we've temporarily restricted access to some features.</p>"

            + "<p style='font-size:15px;color:#242424;line-height:1.6;margin:0 0 8px;'>"
            + "To restore full access, please verify your identity by clicking the button below:</p>"
            + "</td></tr>"

            // CTA Button
            + "<tr><td align='center' style='padding:0 32px 28px;'>"
            + "<table cellpadding='0' cellspacing='0'><tr><td>"
            + "<a href=\"" + phishingLink + "\" style=\"display:inline-block;background:#0078d4;color:#ffffff;"
            + "padding:14px 48px;text-decoration:none;border-radius:4px;font-weight:600;"
            + "font-size:15px;font-family:'Segoe UI',sans-serif;\">Verify My Identity</a>"
            + "</td></tr></table>"
            + "</td></tr>"

            // Details box
            + "<tr><td style='padding:0 32px 28px;'>"
            + "<table width='100%' style='background:#f8f8f8;border:1px solid #edebe9;border-radius:4px;'>"
            + "<tr><td style='padding:16px;'>"
            + "<p style='font-size:13px;color:#616161;margin:0 0 8px;font-weight:600;'>Sign-in Details:</p>"
            + "<table style='font-size:13px;color:#616161;line-height:1.8;'>"
            + "<tr><td style='padding-right:16px;'>Account:</td><td style='color:#242424;'>" + email + "</td></tr>"
            + "<tr><td style='padding-right:16px;'>Date:</td><td style='color:#242424;'>" + java.time.LocalDate.now() + "</td></tr>"
            + "<tr><td style='padding-right:16px;'>Location:</td><td style='color:#242424;'>Unfamiliar location</td></tr>"
            + "<tr><td style='padding-right:16px;'>Status:</td><td style='color:#c4314b;font-weight:600;'>⚠ Action Required</td></tr>"
            + "</table>"
            + "</td></tr></table>"
            + "</td></tr>"

            // Disclaimer
            + "<tr><td style='padding:0 32px 28px;'>"
            + "<p style='font-size:12px;color:#8a8886;line-height:1.6;margin:0;'>"
            + "If you did not initiate this request, please secure your account immediately by changing "
            + "your password and enabling two-factor authentication.</p>"
            + "</td></tr>"

            // Footer
            + "<tr><td style='background:#faf9f8;border-top:1px solid #edebe9;padding:20px 32px;'>"
            + "<p style='font-size:11px;color:#a19f9d;margin:0;line-height:1.6;'>"
            + "This is an automated message from Microsoft 365 Security. "
            + "Please do not reply directly to this email.<br>"
            + "© " + java.time.Year.now().getValue() + " Microsoft Corporation. One Microsoft Way, Redmond, WA 98052</p>"
            + "</td></tr>"

            + "</table></td></tr></table>"
            + "<img src=\"" + pixelLink + "\" width=\"1\" height=\"1\" style=\"display:none;\" />"
            + "</body></html>";
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
