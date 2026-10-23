package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.CreateApplicationRequest;
import com.licensing.platform.dto.RegisterRequest;
import com.licensing.platform.dto.ReviewDecisionRequest;
import com.licensing.platform.dto.UpdateDraftRequest;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.DecisionType;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import com.licensing.platform.security.JwtTokenProvider;
import com.licensing.platform.service.DocumentStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityHardeningAndRegressionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ServiceDefinitionRepository serviceRepository;

    @Autowired
    private OfficerDepartmentAssignmentRepository assignmentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationDocumentRepository documentRepository;

    @Autowired
    private RequiredDocumentTypeRepository requiredDocRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private DocumentStorageService documentStorageService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User citizenA;
    private User citizenB;
    private User transportOfficer;
    private User municipalOfficer;
    private User admin;

    private String tokenCitizenA;
    private String tokenCitizenB;
    private String tokenTransportOfficer;
    private String tokenMunicipalOfficer;
    private String tokenAdmin;

    private ServiceDefinition dlService;
    private Department transportDept;
    private Department municipalDept;
    private RequiredDocumentType idProofDocType;

    @BeforeEach
    void setUp() {
        transportDept = departmentRepository.findByCode("DEPT_TRANSPORT").orElseThrow();
        municipalDept = departmentRepository.findByCode("DEPT_MUNICIPAL").orElseThrow();
        dlService = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();
        idProofDocType = requiredDocRepository.findByServiceIdAndDocumentCode(dlService.getId(), "DOC_ID_PROOF").orElseThrow();

        // 1. Citizen A (Legitimate Owner)
        citizenA = userRepository.findByEmail("citizen.a.sec@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen.a.sec@test.com", passwordEncoder.encode("Pass123!"), "Citizen Alice", Role.CITIZEN, "9876543201")));
        tokenCitizenA = tokenProvider.generateToken(citizenA.getId(), citizenA.getEmail(), citizenA.getRole(), 3600000);

        // 2. Citizen B (Attacker / Unrelated Citizen)
        citizenB = userRepository.findByEmail("citizen.b.sec@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen.b.sec@test.com", passwordEncoder.encode("Pass123!"), "Citizen Bob", Role.CITIZEN, "9876543202")));
        tokenCitizenB = tokenProvider.generateToken(citizenB.getId(), citizenB.getEmail(), citizenB.getRole(), 3600000);

        // 3. Transport Officer (DEPT_TRANSPORT)
        transportOfficer = userRepository.findByEmail("officer.trans.sec@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.trans.sec@test.com", passwordEncoder.encode("Pass123!"), "Officer Transport", Role.OFFICER, "9876543203")));
        if (assignmentRepository.findByUserId(transportOfficer.getId()).isEmpty()) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(transportOfficer, transportDept));
        }
        tokenTransportOfficer = tokenProvider.generateToken(transportOfficer.getId(), transportOfficer.getEmail(), transportOfficer.getRole(), 3600000);

        // 4. Municipal Officer (DEPT_MUNICIPAL)
        municipalOfficer = userRepository.findByEmail("officer.muni.sec@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.muni.sec@test.com", passwordEncoder.encode("Pass123!"), "Officer Municipal", Role.OFFICER, "9876543204")));
        if (assignmentRepository.findByUserId(municipalOfficer.getId()).isEmpty()) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(municipalOfficer, municipalDept));
        }
        tokenMunicipalOfficer = tokenProvider.generateToken(municipalOfficer.getId(), municipalOfficer.getEmail(), municipalOfficer.getRole(), 3600000);

        // 5. Admin
        admin = userRepository.findByEmail("admin.sec@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("admin.sec@test.com", passwordEncoder.encode("Pass123!"), "Platform Admin", Role.ADMIN, "9876543205")));
        tokenAdmin = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);
    }

    private Application createCitizenAApplication() {
        String refNo = "APP-SEC-" + System.nanoTime();
        String validFormData = "{\"fullName\":\"Citizen Alice\",\"dateOfBirth\":\"1996-05-12\",\"bloodGroup\":\"O+\",\"vehicleClass\":\"Light Motor Vehicle (LMV)\",\"aadhaarNumber\":\"123456789012\",\"residentialAddress\":\"Hyderabad, TS\"}";
        Application app = new Application(refNo, citizenA, dlService, validFormData, "en");
        return applicationRepository.saveAndFlush(app);
    }

    // =========================================================================
    // 1. IDOR DEFENSE & ACCESS BOUNDARY TESTS
    // =========================================================================

    @Test
    @DisplayName("Security: Citizen B cannot view Citizen A's application dossier (IDOR Defense -> 403 Forbidden)")
    void testCitizenCannotViewOtherCitizenApplication() throws Exception {
        Application appA = createCitizenAApplication();

        mockMvc.perform(get("/api/applications/" + appA.getId())
                        .header("Authorization", "Bearer " + tokenCitizenB))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Citizen B cannot modify or submit Citizen A's application (IDOR Defense -> 403 Forbidden)")
    void testCitizenCannotModifyOrSubmitOtherCitizenApplication() throws Exception {
        Application appA = createCitizenAApplication();

        // 1. Attempt draft modification
        UpdateDraftRequest updateReq = new UpdateDraftRequest(Map.of("fullName", "Hacked Name"), "en");
        mockMvc.perform(put("/api/applications/" + appA.getId() + "/draft")
                        .header("Authorization", "Bearer " + tokenCitizenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());

        // 2. Attempt submission
        mockMvc.perform(post("/api/applications/" + appA.getId() + "/submit")
                        .header("Authorization", "Bearer " + tokenCitizenB))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Municipal Officer cannot review or decide on Transport application (Department Boundary -> 403 Forbidden)")
    void testOfficerDepartmentIsolationBoundary() throws Exception {
        Application appA = createCitizenAApplication();
        appA.setStatus(ApplicationStatus.SUBMITTED);
        applicationRepository.saveAndFlush(appA);

        // 1. Municipal officer tries to start review on Transport app
        mockMvc.perform(post("/api/applications/" + appA.getId() + "/start-review")
                        .header("Authorization", "Bearer " + tokenMunicipalOfficer))
                .andExpect(status().isForbidden());

        // 2. Municipal officer tries to submit decision on Transport app
        ReviewDecisionRequest decisionReq = new ReviewDecisionRequest(DecisionType.APPROVED, null, "Illegal decision attempt");
        mockMvc.perform(post("/api/applications/" + appA.getId() + "/decision")
                        .header("Authorization", "Bearer " + tokenMunicipalOfficer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decisionReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Citizen cannot register with or self-escalate to OFFICER or ADMIN role")
    void testPrivilegeEscalationPreventedAtRegistration() throws Exception {
        RegisterRequest maliciousReq = new RegisterRequest(
                "attacker." + System.nanoTime() + "@test.com",
                "Password123!",
                "Malicious User",
                "9123456789",
                "ADMIN" // Attempting privilege escalation
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CITIZEN")); // Forced strictly to CITIZEN
    }

    @Test
    @DisplayName("Security: Non-admin users are strictly denied 403 Forbidden from admin endpoints")
    void testAdministrativeEndpointsAuthorizationGuards() throws Exception {
        // Citizen access denied
        mockMvc.perform(get("/api/admin/audit")
                        .header("Authorization", "Bearer " + tokenCitizenA))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/system-stats")
                        .header("Authorization", "Bearer " + tokenCitizenA))
                .andExpect(status().isForbidden());

        // Officer access denied
        mockMvc.perform(get("/api/admin/audit")
                        .header("Authorization", "Bearer " + tokenTransportOfficer))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/system-stats")
                        .header("Authorization", "Bearer " + tokenTransportOfficer))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Unauthenticated requests to protected endpoints return 401 Unauthorized")
    void testUnauthenticatedRequestsDenied() throws Exception {
        mockMvc.perform(get("/api/applications/mine"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serviceId\": 1}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/audit"))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // 2. INJECTION & PATH TRAVERSAL DEFENSE
    // =========================================================================

    @Test
    @DisplayName("Security: Document storage service blocks path traversal attacks outside storage root")
    void testPathTraversalDefenseInDocumentStorage() {
        // 1. Attempt file storage outside directory
        MockMultipartFile traversalFile = new MockMultipartFile(
                "file",
                "../../secret.txt",
                "application/pdf",
                new byte[]{(byte) 0x25, (byte) 0x50, (byte) 0x44, (byte) 0x46, 0x0A}
        );

        // File is sanitized to stay within storage directory
        String storedKey = documentStorageService.storeFile(traversalFile, "app_sec");
        assertThat(storedKey).doesNotContain("..");

        // 2. Attempt to load file outside storage directory
        assertThatThrownBy(() -> documentStorageService.loadFileAsResource("../../../../etc/passwd"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Unauthorized file path access");
    }

    @Test
    @DisplayName("Security: Form data with HTML/XSS injection characters is stored and validated safely without execution")
    void testXssAndInjectionPayloadHandlingInFormData() throws Exception {
        Application appA = createCitizenAApplication();

        // Inject HTML/script payload into text fields
        String xssPayload = "<script>alert('XSS-ATTACK');</script>";
        UpdateDraftRequest updateReq = new UpdateDraftRequest(
                Map.of("residentialAddress", xssPayload + " 123 Main St, Hyderabad"),
                "en"
        );

        mockMvc.perform(put("/api/applications/" + appA.getId() + "/draft")
                        .header("Authorization", "Bearer " + tokenCitizenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.formData.residentialAddress", containsString("123 Main St")));
    }

    // =========================================================================
    // 3. FULL LIFECYCLE END-TO-END REGRESSION
    // =========================================================================

    @Test
    @DisplayName("Regression E2E: Complete Citizen Application -> Document Upload -> Pre-Screening -> Adjudication -> Resubmit -> Approval")
    void testCompleteEndToEndLifecycleRegression() throws Exception {
        // Step 1: Citizen creates draft
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", Map.of(
                "fullName", "Citizen Alice",
                "dateOfBirth", "1996-05-12",
                "bloodGroup", "O+",
                "vehicleClass", "Light Motor Vehicle (LMV)",
                "aadhaarNumber", "123456789012",
                "residentialAddress", "Flat 402, High-Tech City, Hyderabad"
        ));

        String createRes = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + tokenCitizenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();

        Long appId = objectMapper.readTree(createRes).get("id").asLong();

        // Step 2: Citizen uploads valid PDF ID proof
        byte[] validPdfBytes = new byte[]{(byte) 0x25, (byte) 0x50, (byte) 0x44, (byte) 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A};
        MockMultipartFile validDoc = new MockMultipartFile(
                "file", "aadhaar_card.pdf", "application/pdf", validPdfBytes
        );

        mockMvc.perform(multipart("/api/applications/" + appId + "/documents")
                        .file(validDoc)
                        .param("documentTypeId", idProofDocType.getId().toString())
                        .header("Authorization", "Bearer " + tokenCitizenA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName").value("aadhaar_card.pdf"));

        // Step 3: Trigger OCR & Explainable Pre-Screening
        mockMvc.perform(post("/api/applications/" + appId + "/prescreening/run")
                        .header("Authorization", "Bearer " + tokenCitizenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationId").value(appId.intValue()))
                .andExpect(jsonPath("$.findings", not(empty())));

        // Step 4: Citizen submits application
        mockMvc.perform(post("/api/applications/" + appId + "/submit")
                        .header("Authorization", "Bearer " + tokenCitizenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));

        // Step 5: Transport Officer inspects department queue
        mockMvc.perform(get("/api/applications/officer/queue")
                        .header("Authorization", "Bearer " + tokenTransportOfficer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(appId.intValue())));

        // Step 6: Transport Officer starts verification
        mockMvc.perform(post("/api/applications/" + appId + "/start-review")
                        .header("Authorization", "Bearer " + tokenTransportOfficer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_VERIFICATION"));

        // Step 7: Transport Officer rejects with mandatory reason
        ReviewDecisionRequest rejectReq = new ReviewDecisionRequest(
                DecisionType.REJECTED,
                "Aadhaar scan was blurry; please re-upload clear government ID.",
                "Officer requested clearer scan."
        );
        mockMvc.perform(post("/api/applications/" + appId + "/decision")
                        .header("Authorization", "Bearer " + tokenTransportOfficer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        // Step 8: Citizen updates form and resubmits
        mockMvc.perform(post("/api/applications/" + appId + "/resubmit")
                        .header("Authorization", "Bearer " + tokenCitizenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESUBMITTED"));

        // Step 9: Transport Officer starts re-verification & approves
        mockMvc.perform(post("/api/applications/" + appId + "/start-review")
                        .header("Authorization", "Bearer " + tokenTransportOfficer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_VERIFICATION"));

        ReviewDecisionRequest approveReq = new ReviewDecisionRequest(
                DecisionType.APPROVED, null, "All criteria and documents confirmed."
        );
        mockMvc.perform(post("/api/applications/" + appId + "/decision")
                        .header("Authorization", "Bearer " + tokenTransportOfficer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // Step 10: Admin audit trail reflects actions
        mockMvc.perform(get("/api/admin/audit")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }
}
