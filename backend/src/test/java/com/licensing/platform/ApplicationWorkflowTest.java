package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.*;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.DecisionType;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import com.licensing.platform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApplicationWorkflowTest {

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
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private ReviewDecisionRepository reviewDecisionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User citizen1;
    private User citizen2;
    private User transportOfficer;
    private User municipalOfficer;
    private User admin;

    private String citizen1Token;
    private String citizen2Token;
    private String transportOfficerToken;
    private String municipalOfficerToken;
    private String adminToken;

    private ServiceDefinition dlService;
    private ServiceDefinition tradeService;
    private Department transportDept;
    private Department municipalDept;

    @BeforeEach
    void setUp() {
        transportDept = departmentRepository.findByCode("DEPT_TRANSPORT").orElseThrow();
        municipalDept = departmentRepository.findByCode("DEPT_MUNICIPAL").orElseThrow();
        dlService = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();
        tradeService = serviceRepository.findByCode("SRV_TRADE_LICENSE").orElseThrow();

        // 1. Citizen 1
        citizen1 = userRepository.findByEmail("citizen1.wf@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen1.wf@test.com", passwordEncoder.encode("Pass123"), "Ramesh Citizen", Role.CITIZEN, "9876543210")));
        citizen1Token = tokenProvider.generateToken(citizen1.getId(), citizen1.getEmail(), citizen1.getRole(), 3600000);

        // 2. Citizen 2
        citizen2 = userRepository.findByEmail("citizen2.wf@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen2.wf@test.com", passwordEncoder.encode("Pass123"), "Sita Citizen", Role.CITIZEN, "9876543211")));
        citizen2Token = tokenProvider.generateToken(citizen2.getId(), citizen2.getEmail(), citizen2.getRole(), 3600000);

        // 3. Transport Officer (assigned to DEPT_TRANSPORT)
        transportOfficer = userRepository.findByEmail("officer.transport@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.transport@test.com", passwordEncoder.encode("Pass123"), "Officer Rao", Role.OFFICER, "9876543212")));
        transportOfficerToken = tokenProvider.generateToken(transportOfficer.getId(), transportOfficer.getEmail(), transportOfficer.getRole(), 3600000);

        if (!assignmentRepository.existsByUserIdAndDepartmentId(transportOfficer.getId(), transportDept.getId())) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(transportOfficer, transportDept));
        }

        // 4. Municipal Officer (assigned to DEPT_MUNICIPAL)
        municipalOfficer = userRepository.findByEmail("officer.municipal@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.municipal@test.com", passwordEncoder.encode("Pass123"), "Officer Reddy", Role.OFFICER, "9876543213")));
        municipalOfficerToken = tokenProvider.generateToken(municipalOfficer.getId(), municipalOfficer.getEmail(), municipalOfficer.getRole(), 3600000);

        if (!assignmentRepository.existsByUserIdAndDepartmentId(municipalOfficer.getId(), municipalDept.getId())) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(municipalOfficer, municipalDept));
        }

        // 5. Admin
        admin = userRepository.findByEmail("admin.wf@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("admin.wf@test.com", passwordEncoder.encode("Pass123"), "Admin User", Role.ADMIN, "9999999999")));
        adminToken = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);
    }

    private Map<String, Object> createValidDrivingLicenseData() {
        Map<String, Object> data = new HashMap<>();
        data.put("fullName", "Ramesh Kumar");
        data.put("dateOfBirth", "1995-08-15");
        data.put("bloodGroup", "O+");
        data.put("vehicleClass", "Light Motor Vehicle (LMV)");
        data.put("aadhaarNumber", "123456789012");
        data.put("residentialAddress", "Flat 101, Lakeview Residency, Hyderabad, 500081");
        return data;
    }

    // =========================================================================
    // 1. CITIZEN DRAFT CREATION & UPDATES
    // =========================================================================

    @Test
    @DisplayName("Citizen successfully creates a new application draft")
    void testCreateDraftSuccess() throws Exception {
        CreateApplicationRequest req = new CreateApplicationRequest(dlService.getId(), "te", Map.of("fullName", "Ramesh Initial"));

        mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.serviceCode", is("SRV_DRIVING_LICENSE")))
                .andExpect(jsonPath("$.languagePreference", is("te")))
                .andExpect(jsonPath("$.referenceNumber", matchesPattern("^APP-[0-9]{8}-[A-Z0-9]{5}$")))
                .andExpect(jsonPath("$.statusHistory", hasSize(1)))
                .andExpect(jsonPath("$.statusHistory[0].toStatus", is("DRAFT")));
    }

    @Test
    @DisplayName("Citizen can update draft form data incrementally without validation errors")
    void testUpdateDraftFormData() throws Exception {
        // Create draft
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", null);
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        // Update draft with partial data
        UpdateDraftRequest updateReq = new UpdateDraftRequest(Map.of("fullName", "Ramesh K", "bloodGroup", "B+"), "en");

        mockMvc.perform(put("/api/applications/" + created.getId() + "/draft")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.formData.fullName", is("Ramesh K")))
                .andExpect(jsonPath("$.formData.bloodGroup", is("B+")));
    }

    // =========================================================================
    // 2. FORM VALIDATION & SUBMISSION
    // =========================================================================

    @Test
    @DisplayName("Submitting draft with missing required fields fails with HTTP 400 & detailed field errors")
    void testSubmitDraftWithMissingFieldsReturns400() throws Exception {
        // Create draft with incomplete data
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", Map.of("fullName", "Ramesh"));
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        // Submit without completing required fields
        mockMvc.perform(post("/api/applications/" + created.getId() + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Error")))
                .andExpect(jsonPath("$.validationErrors.dateOfBirth", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.aadhaarNumber", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.residentialAddress", notNullValue()));

        // Application status must remain DRAFT
        Application app = applicationRepository.findById(created.getId()).orElseThrow();
        assertThat(app.getStatus()).isEqualTo(ApplicationStatus.DRAFT);
    }

    @Test
    @DisplayName("Submitting draft with regex/age rule violations fails with HTTP 400")
    void testSubmitDraftWithRuleViolationsReturns400() throws Exception {
        Map<String, Object> invalidData = createValidDrivingLicenseData();
        invalidData.put("aadhaarNumber", "12345"); // Invalid: Must be 12 digits
        invalidData.put("dateOfBirth", LocalDate.now().minusYears(15).toString()); // Invalid: Under 18

        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", invalidData);
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        mockMvc.perform(post("/api/applications/" + created.getId() + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.aadhaarNumber", containsString("format is invalid")))
                .andExpect(jsonPath("$.validationErrors.dateOfBirth", containsString("minimum required age is 18")));
    }

    @Test
    @DisplayName("Submitting draft with valid data transitions DRAFT -> SUBMITTED and sends notification")
    void testSubmitDraftValidDataSuccess() throws Exception {
        Map<String, Object> validData = createValidDrivingLicenseData();

        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", validData);
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        // Submit
        mockMvc.perform(post("/api/applications/" + created.getId() + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")))
                .andExpect(jsonPath("$.submittedAt", notNullValue()))
                .andExpect(jsonPath("$.statusHistory", hasSize(2)))
                .andExpect(jsonPath("$.statusHistory[1].fromStatus", is("DRAFT")))
                .andExpect(jsonPath("$.statusHistory[1].toStatus", is("SUBMITTED")));

        // Verify notification was sent
        assertThat(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(citizen1.getId())).isNotEmpty();
    }

    @Test
    @DisplayName("Cannot submit an already submitted application (invalid transition returns 400)")
    void testCannotSubmitAlreadySubmittedApplication() throws Exception {
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", createValidDrivingLicenseData());
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        // Submit once
        mockMvc.perform(post("/api/applications/" + created.getId() + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk());

        // Attempt submit again
        mockMvc.perform(post("/api/applications/" + created.getId() + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Invalid State Transition")));
    }

    // =========================================================================
    // 3. AUTHORIZATION & IDOR ACCESS CONTROL
    // =========================================================================

    @Test
    @DisplayName("Citizen cannot view or modify another citizen's application (403 Forbidden)")
    void testCitizenCannotAccessOtherCitizenApplication() throws Exception {
        // Citizen 1 creates application
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", null);
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        // Citizen 2 attempts to view Citizen 1's application
        mockMvc.perform(get("/api/applications/" + created.getId())
                        .header("Authorization", "Bearer " + citizen2Token))
                .andExpect(status().isForbidden());

        // Citizen 2 attempts to update Citizen 1's application
        UpdateDraftRequest updateReq = new UpdateDraftRequest(Map.of("fullName", "Hacker"), "en");
        mockMvc.perform(put("/api/applications/" + created.getId() + "/draft")
                        .header("Authorization", "Bearer " + citizen2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Citizen cannot make officer review decisions (403 Forbidden)")
    void testCitizenCannotMakeReviewDecision() throws Exception {
        ReviewDecisionRequest decisionReq = new ReviewDecisionRequest(DecisionType.APPROVED, null, "Self-approved");

        mockMvc.perform(post("/api/applications/1/decision")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(decisionReq)))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 4. OFFICER VERIFICATION QUEUE & DECISION LIFECYCLE
    // =========================================================================

    @Test
    @DisplayName("Officer can only access applications in assigned department (403 Forbidden for other depts)")
    void testOfficerDepartmentBoundaryEnforcement() throws Exception {
        // Create and submit Trade License application (DEPT_MUNICIPAL)
        Application tradeApp = new Application(
                "APP-20261023-TRADE", citizen1, tradeService, "{}", "en"
        );
        tradeApp.setStatus(ApplicationStatus.SUBMITTED);
        tradeApp = applicationRepository.saveAndFlush(tradeApp);

        // Transport Officer attempts to review Municipal application
        mockMvc.perform(post("/api/applications/" + tradeApp.getId() + "/start-review")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Assigned officer views queue, starts review, and rejects with mandatory reason")
    void testOfficerQueueAndRejectionWorkflow() throws Exception {
        // Citizen submits Driving License
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", createValidDrivingLicenseData());
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);

        mockMvc.perform(post("/api/applications/" + created.getId() + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk());

        // Transport Officer checks queue
        mockMvc.perform(get("/api/applications/officer/queue")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(created.getId().intValue())));

        // Officer starts review: SUBMITTED -> UNDER_VERIFICATION
        mockMvc.perform(post("/api/applications/" + created.getId() + "/start-review")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UNDER_VERIFICATION")))
                .andExpect(jsonPath("$.statusHistory", hasSize(3)));

        // Rejection without reason fails with 400
        ReviewDecisionRequest emptyReasonReq = new ReviewDecisionRequest(DecisionType.REJECTED, "   ", "internal note");
        mockMvc.perform(post("/api/applications/" + created.getId() + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReasonReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.rejectionReason", notNullValue()));

        // Rejection with mandatory reason succeeds
        ReviewDecisionRequest validReject = new ReviewDecisionRequest(
                DecisionType.REJECTED,
                "Uploaded Aadhaar card copy is blurred and date of birth is unreadable",
                "Flagged during manual pre-screen verification"
        );

        mockMvc.perform(post("/api/applications/" + created.getId() + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.reviewDecisions", hasSize(1)))
                .andExpect(jsonPath("$.reviewDecisions[0].decision", is("REJECTED")))
                .andExpect(jsonPath("$.reviewDecisions[0].rejectionReason", containsString("blurred")));
    }

    @Test
    @DisplayName("Complete end-to-end lifecycle: DRAFT -> SUBMITTED -> UNDER_VERIFICATION -> REJECTED -> RESUBMITTED -> APPROVED")
    void testCompleteLifecycleWorkflow() throws Exception {
        // 1. Citizen creates draft
        CreateApplicationRequest createReq = new CreateApplicationRequest(dlService.getId(), "en", createValidDrivingLicenseData());
        MvcResult res = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ApplicationDetailResponse app = objectMapper.readValue(res.getResponse().getContentAsString(), ApplicationDetailResponse.class);
        Long appId = app.getId();

        // 2. Submit: DRAFT -> SUBMITTED
        mockMvc.perform(post("/api/applications/" + appId + "/submit")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));

        // 3. Officer starts review: SUBMITTED -> UNDER_VERIFICATION
        mockMvc.perform(post("/api/applications/" + appId + "/start-review")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UNDER_VERIFICATION")));

        // 4. Officer rejects: UNDER_VERIFICATION -> REJECTED
        ReviewDecisionRequest rejectReq = new ReviewDecisionRequest(
                DecisionType.REJECTED, "Address line incomplete", "Needs house number"
        );
        mockMvc.perform(post("/api/applications/" + appId + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));

        // 5. Citizen updates form data and resubmits: REJECTED -> RESUBMITTED
        Map<String, Object> correctedData = createValidDrivingLicenseData();
        correctedData.put("residentialAddress", "House #4-12/A, Jubilee Hills, Hyderabad 500081");
        SubmitApplicationRequest resubmitReq = new SubmitApplicationRequest(correctedData);

        mockMvc.perform(post("/api/applications/" + appId + "/resubmit")
                        .header("Authorization", "Bearer " + citizen1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resubmitReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESUBMITTED")));

        // 6. Officer reviews resubmitted: RESUBMITTED -> UNDER_VERIFICATION
        mockMvc.perform(post("/api/applications/" + appId + "/start-review")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UNDER_VERIFICATION")));

        // 7. Officer approves: UNDER_VERIFICATION -> APPROVED
        ReviewDecisionRequest approveReq = new ReviewDecisionRequest(
                DecisionType.APPROVED, null, "All details verified and clear"
        );
        mockMvc.perform(post("/api/applications/" + appId + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.statusHistory", hasSize(7)))
                // Verify chronological status history: DRAFT -> SUBMITTED -> UNDER_VERIFICATION -> REJECTED -> RESUBMITTED -> UNDER_VERIFICATION -> APPROVED
                .andExpect(jsonPath("$.statusHistory[0].toStatus", is("DRAFT")))
                .andExpect(jsonPath("$.statusHistory[1].toStatus", is("SUBMITTED")))
                .andExpect(jsonPath("$.statusHistory[2].toStatus", is("UNDER_VERIFICATION")))
                .andExpect(jsonPath("$.statusHistory[3].toStatus", is("REJECTED")))
                .andExpect(jsonPath("$.statusHistory[4].toStatus", is("RESUBMITTED")))
                .andExpect(jsonPath("$.statusHistory[5].toStatus", is("UNDER_VERIFICATION")))
                .andExpect(jsonPath("$.statusHistory[6].toStatus", is("APPROVED")))
                .andExpect(jsonPath("$.reviewDecisions", hasSize(2)));
    }

    @Test
    @DisplayName("Admin has full cross-departmental oversight to view and filter all applications")
    void testAdminOversightOfApplications() throws Exception {
        // Create an application
        Application app = new Application("APP-ADMIN-CHECK", citizen1, dlService, "{}", "en");
        app.setStatus(ApplicationStatus.SUBMITTED);
        applicationRepository.saveAndFlush(app);

        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "SUBMITTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].referenceNumber", hasItem("APP-ADMIN-CHECK")));
    }
}
