package com.licensing.platform;

import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.*;
import com.licensing.platform.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DatabaseMigrationAndPersistenceTest {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ServiceDefinitionRepository serviceRepository;

    @Autowired
    private ServiceFieldRepository serviceFieldRepository;

    @Autowired
    private RequiredDocumentTypeRepository requiredDocRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationDocumentRepository applicationDocumentRepository;

    @Autowired
    private OcrExtractionRepository ocrExtractionRepository;

    @Autowired
    private PrescreeningFindingRepository prescreeningFindingRepository;

    @Autowired
    private ReviewDecisionRepository reviewDecisionRepository;

    @Autowired
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private VoiceInteractionLogRepository voiceInteractionLogRepository;

    @Test
    @DisplayName("Verify clean Flyway migrations seed sample services and departments")
    void testFlywaySeedData() {
        List<Department> departments = departmentRepository.findAll();
        assertThat(departments).hasSizeGreaterThanOrEqualTo(2);
        assertThat(departmentRepository.findByCode("DEPT_TRANSPORT")).isPresent();
        assertThat(departmentRepository.findByCode("DEPT_MUNICIPAL")).isPresent();

        Optional<ServiceDefinition> dlService = serviceRepository.findByCode("SRV_DRIVING_LICENSE");
        assertThat(dlService).isPresent();
        assertThat(dlService.get().getName()).contains("Driving License");
        assertThat(dlService.get().getSampleFee()).isEqualByComparingTo(new BigDecimal("500.00"));

        List<ServiceField> dlFields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(dlService.get().getId());
        assertThat(dlFields).hasSize(6);
        assertThat(dlFields.get(0).getFieldKey()).isEqualTo("fullName");
        assertThat(dlFields.get(0).getLabelEn()).contains("Full Name");
        assertThat(dlFields.get(0).getLabelTe()).isNotEmpty();

        List<RequiredDocumentType> dlDocs = requiredDocRepository.findByServiceId(dlService.get().getId());
        assertThat(dlDocs).hasSize(3);

        Optional<ServiceDefinition> tradeService = serviceRepository.findByCode("SRV_TRADE_LICENSE");
        assertThat(tradeService).isPresent();
        assertThat(tradeService.get().getName()).contains("Trade");
    }

    @Test
    @DisplayName("Persist and read application lifecycle, documents, OCR extractions, and pre-screening findings")
    void testPersistAndReadCompleteLifecycle() {
        // 1. Create and persist citizen
        User citizen = new User("citizen.tester@example.com", "$2a$10$hashvalue", "Ramesh Kumar", Role.CITIZEN, "+919876543210");
        User savedCitizen = userRepository.save(citizen);
        assertThat(savedCitizen.getId()).isNotNull();

        // 2. Fetch service
        ServiceDefinition service = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();

        // 3. Create application
        String refNo = "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String sampleFormData = "{\"fullName\":\"Ramesh Kumar\",\"dateOfBirth\":\"1995-05-15\",\"bloodGroup\":\"O+\",\"vehicleClass\":\"Motorcycle with Gear (MCWG)\",\"aadhaarNumber\":\"123456789012\",\"residentialAddress\":\"Flat 201, Green Meadows, Hyderabad\"}";
        Application app = new Application(refNo, savedCitizen, service, sampleFormData, "te");
        Application savedApp = applicationRepository.save(app);
        assertThat(savedApp.getId()).isNotNull();
        assertThat(savedApp.getStatus()).isEqualTo(ApplicationStatus.DRAFT);
        assertThat(savedApp.getLanguagePreference()).isEqualTo("te");

        // 4. Attach document
        RequiredDocumentType docType = requiredDocRepository.findByServiceId(service.getId()).get(0);
        String storageKey = UUID.randomUUID().toString();
        ApplicationDocument doc = new ApplicationDocument(savedApp, docType, "aadhaar_card.pdf", storageKey, "application/pdf", 1048576L, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        ApplicationDocument savedDoc = applicationDocumentRepository.save(doc);
        assertThat(savedDoc.getId()).isNotNull();

        // 5. Attach OCR extraction
        OcrExtraction ocr = new OcrExtraction(savedDoc, "Tesseract-OCR", "5.4.0", "GOVERNMENT OF INDIA\nName: Ramesh Kumar\nDOB: 15/05/1995\nAadhaar: 1234 5678 9012", "{\"name\":\"Ramesh Kumar\",\"dob\":\"1995-05-15\",\"idNumber\":\"123456789012\"}", new BigDecimal("0.9650"), "COMPLETED");
        OcrExtraction savedOcr = ocrExtractionRepository.save(ocr);
        assertThat(savedOcr.getId()).isNotNull();
        assertThat(savedOcr.getConfidenceScore()).isEqualByComparingTo(new BigDecimal("0.9650"));

        // 6. Record pre-screening finding
        PrescreeningFinding finding = new PrescreeningFinding(savedApp, savedDoc, "RULE_IDENTITY_MATCH", "fullName", FindingOutcome.PASS, "Ramesh Kumar", "Ramesh Kumar", "Applicant name matches document text with 100% normalized similarity.", "None required.", new BigDecimal("0.9900"));
        PrescreeningFinding savedFinding = prescreeningFindingRepository.save(finding);
        assertThat(savedFinding.getId()).isNotNull();
        assertThat(savedFinding.getOutcome()).isEqualTo(FindingOutcome.PASS);

        // 7. Status transition history
        ApplicationStatusHistory history = new ApplicationStatusHistory(savedApp, "DRAFT", "SUBMITTED", savedCitizen, "Citizen submitted application via guided wizard");
        ApplicationStatusHistory savedHistory = statusHistoryRepository.save(history);
        assertThat(savedHistory.getId()).isNotNull();

        // 8. Notification
        Notification notification = new Notification(savedCitizen, savedApp, "Application Submitted", "Your application " + refNo + " has been submitted successfully.");
        Notification savedNotice = notificationRepository.save(notification);
        assertThat(savedNotice.getId()).isNotNull();
        assertThat(savedNotice.isRead()).isFalse();

        // 9. Audit Log
        AuditLog audit = new AuditLog(savedCitizen, "SUBMIT_APPLICATION", "APPLICATION", savedApp.getId().toString(), "127.0.0.1", "{\"reference\":\"" + refNo + "\"}");
        AuditLog savedAudit = auditLogRepository.save(audit);
        assertThat(savedAudit.getId()).isNotNull();

        // 10. Voice Telemetry Log
        VoiceInteractionLog voiceLog = new VoiceInteractionLog(savedApp.getId(), "SRV_DRIVING_LICENSE", "fullName", "te-IN", "రమేష్ కుమార్", "Ramesh Kumar", 0.95, 3200, 1, true, "VOICE");
        VoiceInteractionLog savedVoiceLog = voiceInteractionLogRepository.save(voiceLog);
        assertThat(savedVoiceLog.getId()).isNotNull();
        assertThat(savedVoiceLog.getFieldKey()).isEqualTo("fullName");
        assertThat(savedVoiceLog.getLanguage()).isEqualTo("te-IN");

        // Read and verify relationships
        List<Application> citizenApps = applicationRepository.findByCitizenIdOrderByCreatedAtDesc(savedCitizen.getId());
        assertThat(citizenApps).hasSize(1);
        assertThat(citizenApps.get(0).getReferenceNumber()).isEqualTo(refNo);

        List<PrescreeningFinding> findings = prescreeningFindingRepository.findByApplicationId(savedApp.getId());
        assertThat(findings).hasSize(1);
        assertThat(findings.get(0).getRuleCode()).isEqualTo("RULE_IDENTITY_MATCH");

        List<VoiceInteractionLog> appVoiceLogs = voiceInteractionLogRepository.findByApplicationId(savedApp.getId());
        assertThat(appVoiceLogs).hasSize(1);
        assertThat(appVoiceLogs.get(0).getServiceCode()).isEqualTo("SRV_DRIVING_LICENSE");
    }

    @Test
    @DisplayName("Verify unique constraint on user email enforces integrity")
    void testUniqueUserEmailConstraint() {
        User user1 = new User("officer.dept@example.com", "hash1", "Officer One", Role.OFFICER, "123");
        userRepository.saveAndFlush(user1);

        User duplicateUser = new User("officer.dept@example.com", "hash2", "Officer Two", Role.OFFICER, "456");
        assertThatThrownBy(() -> userRepository.saveAndFlush(duplicateUser))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
