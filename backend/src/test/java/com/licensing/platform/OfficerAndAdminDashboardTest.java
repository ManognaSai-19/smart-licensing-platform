package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.CreateApplicationRequest;
import com.licensing.platform.dto.ReviewDecisionRequest;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OfficerAndAdminDashboardTest {

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
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User citizen;
    private User transportOfficer;
    private User municipalOfficer;
    private User admin;

    private String citizenToken;
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

        // 1. Citizen
        citizen = userRepository.findByEmail("citizen.officertest@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen.officertest@test.com", passwordEncoder.encode("Pass123"), "Citizen Tester", Role.CITIZEN, "9876543210")));
        citizenToken = tokenProvider.generateToken(citizen.getId(), citizen.getEmail(), citizen.getRole(), 3600000);

        // 2. Transport Officer
        transportOfficer = userRepository.findByEmail("officer.transport.test@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.transport.test@test.com", passwordEncoder.encode("Pass123"), "Officer Transport", Role.OFFICER, "9876543212")));
        if (assignmentRepository.findByUserId(transportOfficer.getId()).isEmpty()) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(transportOfficer, transportDept));
        }
        transportOfficerToken = tokenProvider.generateToken(transportOfficer.getId(), transportOfficer.getEmail(), transportOfficer.getRole(), 3600000);

        // 3. Municipal Officer
        municipalOfficer = userRepository.findByEmail("officer.municipal.test@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.municipal.test@test.com", passwordEncoder.encode("Pass123"), "Officer Municipal", Role.OFFICER, "9876543213")));
        if (assignmentRepository.findByUserId(municipalOfficer.getId()).isEmpty()) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(municipalOfficer, municipalDept));
        }
        municipalOfficerToken = tokenProvider.generateToken(municipalOfficer.getId(), municipalOfficer.getEmail(), municipalOfficer.getRole(), 3600000);

        // 4. Admin
        admin = userRepository.findByEmail("admin.officertest@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("admin.officertest@test.com", passwordEncoder.encode("Pass123"), "Admin Tester", Role.ADMIN, "9876543214")));
        adminToken = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);
    }

    private Application createSubmittedApplication(ServiceDefinition service, User applicant) {
        String refNo = "APP-TEST-" + System.nanoTime();
        String validFormData = service.getCode().equals("SRV_DRIVING_LICENSE")
                ? "{\"fullName\":\"Ramesh Kumar\",\"dateOfBirth\":\"1995-08-15\",\"bloodGroup\":\"O+\",\"vehicleClass\":\"Light Motor Vehicle (LMV)\",\"aadhaarNumber\":\"123456789012\",\"residentialAddress\":\"Hyderabad, TS\"}"
                : "{\"businessName\":\"Sri Sai Traders\",\"ownerName\":\"Ramesh Kumar\",\"tradeCategory\":\"Retail Merchant\",\"businessAddress\":\"Hyderabad, TS\",\"panNumber\":\"ABCDE1234F\"}";

        Application app = new Application(refNo, applicant, service, validFormData, "en");
        app.setStatus(ApplicationStatus.SUBMITTED);
        return applicationRepository.saveAndFlush(app);
    }

    @Test
    @DisplayName("Verify Officer department queue isolation: Transport vs Municipal")
    void testOfficerQueueIsolationByDepartment() throws Exception {
        Application transportApp = createSubmittedApplication(dlService, citizen);
        Application municipalApp = createSubmittedApplication(tradeService, citizen);

        // Transport officer query
        mockMvc.perform(get("/api/applications/officer/queue")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(transportApp.getId().intValue())))
                .andExpect(jsonPath("$[*].id", not(hasItem(municipalApp.getId().intValue()))));

        // Municipal officer query
        mockMvc.perform(get("/api/applications/officer/queue")
                        .header("Authorization", "Bearer " + municipalOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(municipalApp.getId().intValue())))
                .andExpect(jsonPath("$[*].id", not(hasItem(transportApp.getId().intValue()))));
    }

    @Test
    @DisplayName("Verify Officer start review and rejection with mandatory explanation")
    void testOfficerCommenceReviewAndRejection() throws Exception {
        Application app = createSubmittedApplication(dlService, citizen);

        // 1. Officer starts verification
        mockMvc.perform(post("/api/applications/" + app.getId() + "/start-review")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_VERIFICATION"));

        // 2. Reject without reason -> 400 Bad Request
        ReviewDecisionRequest emptyReasonReq = new ReviewDecisionRequest(DecisionType.REJECTED, "", "Notes");
        mockMvc.perform(post("/api/applications/" + app.getId() + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReasonReq)))
                .andExpect(status().isBadRequest());

        // 3. Reject with mandatory reason -> 200 OK
        ReviewDecisionRequest validReject = new ReviewDecisionRequest(DecisionType.REJECTED, "Aadhaar address does not match permanent address.", "Please re-upload valid address proof.");
        mockMvc.perform(post("/api/applications/" + app.getId() + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.reviewDecisions[0].decision").value("REJECTED"))
                .andExpect(jsonPath("$.reviewDecisions[0].rejectionReason", containsString("Aadhaar address does not match")));
    }

    @Test
    @DisplayName("Verify Officer approval decision transitions application to APPROVED")
    void testOfficerApprovalDecision() throws Exception {
        Application app = createSubmittedApplication(dlService, citizen);

        // 1. Start review
        mockMvc.perform(post("/api/applications/" + app.getId() + "/start-review")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk());

        // 2. Approve application
        ReviewDecisionRequest approveReq = new ReviewDecisionRequest(DecisionType.APPROVED, null, "All criteria and documents verified successfully.");
        mockMvc.perform(post("/api/applications/" + app.getId() + "/decision")
                        .header("Authorization", "Bearer " + transportOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.reviewDecisions[0].decision").value("APPROVED"));
    }

    @Test
    @DisplayName("Verify Officer cannot decide on application outside assigned department (403 Forbidden)")
    void testOfficerDepartmentBoundaryEnforcement() throws Exception {
        Application transportApp = createSubmittedApplication(dlService, citizen);

        // Municipal officer attempts decision on Transport app
        ReviewDecisionRequest req = new ReviewDecisionRequest(DecisionType.APPROVED, null, "Unauthorized attempt");
        mockMvc.perform(post("/api/applications/" + transportApp.getId() + "/decision")
                        .header("Authorization", "Bearer " + municipalOfficerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Verify Admin cross-departmental application oversight")
    void testAdminApplicationsOversight() throws Exception {
        Application transportApp = createSubmittedApplication(dlService, citizen);
        Application municipalApp = createSubmittedApplication(tradeService, citizen);

        // Admin sees all applications
        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(transportApp.getId().intValue())))
                .andExpect(jsonPath("$[*].id", hasItem(municipalApp.getId().intValue())));
    }

    @Test
    @DisplayName("Verify Admin audit trail logs and system statistics endpoints")
    void testAdminAuditAndSystemStats() throws Exception {
        // Create an application so totalApplications >= 1
        createSubmittedApplication(dlService, citizen);

        // Record test audit log
        auditLogRepository.saveAndFlush(new AuditLog(admin, "TEST_ADMIN_ACTION", "SYSTEM", "0", "127.0.0.1", "{}"));

        // 1. Audit logs endpoint
        mockMvc.perform(get("/api/admin/audit")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].action").isNotEmpty());

        // 2. System stats endpoint
        mockMvc.perform(get("/api/admin/system-stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalApplications", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.statusBreakdown").isMap());
    }

    @Test
    @DisplayName("Verify Non-Admin roles are denied 403 Forbidden from admin endpoints")
    void testNonAdminForbiddenFromAdminEndpoints() throws Exception {
        // Citizen access denied
        mockMvc.perform(get("/api/admin/audit")
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isForbidden());

        // Officer access denied
        mockMvc.perform(get("/api/admin/system-stats")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isForbidden());
    }
}
