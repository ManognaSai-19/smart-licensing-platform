package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.PrescreeningFindingResponse;
import com.licensing.platform.dto.PrescreeningSummaryResponse;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.FindingOutcome;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import com.licensing.platform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PrescreeningAndOcrTest {

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
    private RequiredDocumentTypeRepository requiredDocumentTypeRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationDocumentRepository documentRepository;

    @Autowired
    private OfficerDepartmentAssignmentRepository assignmentRepository;

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
    private Department transportDept;
    private Department municipalDept;
    private RequiredDocumentType idProofType;
    private RequiredDocumentType addressProofType;

    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A};

    @BeforeEach
    void setUp() {
        transportDept = departmentRepository.findByCode("DEPT_TRANSPORT").orElseThrow();
        municipalDept = departmentRepository.findByCode("DEPT_MUNICIPAL").orElseThrow();
        dlService = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();

        idProofType = requiredDocumentTypeRepository.findByServiceIdAndDocumentCode(dlService.getId(), "DOC_ID_PROOF").orElseThrow();
        addressProofType = requiredDocumentTypeRepository.findByServiceIdAndDocumentCode(dlService.getId(), "DOC_ADDRESS_PROOF").orElseThrow();

        // Citizen 1
        citizen1 = userRepository.findByEmail("citizen1.ocr@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen1.ocr@test.com", passwordEncoder.encode("Pass123"), "Ramesh Kumar", Role.CITIZEN, "9876543101")));
        citizen1Token = tokenProvider.generateToken(citizen1.getId(), citizen1.getEmail(), citizen1.getRole(), 3600000);

        // Citizen 2
        citizen2 = userRepository.findByEmail("citizen2.ocr@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen2.ocr@test.com", passwordEncoder.encode("Pass123"), "Anita Citizen", Role.CITIZEN, "9876543102")));
        citizen2Token = tokenProvider.generateToken(citizen2.getId(), citizen2.getEmail(), citizen2.getRole(), 3600000);

        // Transport Officer
        transportOfficer = userRepository.findByEmail("officer.ocr.transport@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.ocr.transport@test.com", passwordEncoder.encode("Pass123"), "Officer Transport", Role.OFFICER, "9876543103")));
        transportOfficerToken = tokenProvider.generateToken(transportOfficer.getId(), transportOfficer.getEmail(), transportOfficer.getRole(), 3600000);
        if (!assignmentRepository.existsByUserIdAndDepartmentId(transportOfficer.getId(), transportDept.getId())) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(transportOfficer, transportDept));
        }

        // Municipal Officer
        municipalOfficer = userRepository.findByEmail("officer.ocr.municipal@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.ocr.municipal@test.com", passwordEncoder.encode("Pass123"), "Officer Municipal", Role.OFFICER, "9876543104")));
        municipalOfficerToken = tokenProvider.generateToken(municipalOfficer.getId(), municipalOfficer.getEmail(), municipalOfficer.getRole(), 3600000);
        if (!assignmentRepository.existsByUserIdAndDepartmentId(municipalOfficer.getId(), municipalDept.getId())) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(municipalOfficer, municipalDept));
        }

        // Admin
        admin = userRepository.findByEmail("admin.ocr@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("admin.ocr@test.com", passwordEncoder.encode("Pass123"), "Admin OCR", Role.ADMIN, "9876543105")));
        adminToken = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);
    }

    private byte[] createTestPdf(String text) {
        byte[] textBytes = text.getBytes(StandardCharsets.UTF_8);
        byte[] combined = new byte[PDF_MAGIC.length + textBytes.length];
        System.arraycopy(PDF_MAGIC, 0, combined, 0, PDF_MAGIC.length);
        System.arraycopy(textBytes, 0, combined, PDF_MAGIC.length, textBytes.length);
        return combined;
    }

    @Test
    @DisplayName("Group A Evaluation: Perfectly matching documents yield PASSED status with 100% confidence")
    void testGroupAPerfectMatchPrescreening() throws Exception {
        // 1. Create Application with complete form data
        Map<String, Object> form = new HashMap<>();
        form.put("fullName", "Ramesh Kumar");
        form.put("dateOfBirth", "1995-05-15");
        form.put("aadhaarNumber", "234567890123");
        form.put("bloodGroup", "O+");
        form.put("vehicleClass", "Motorcycle with Gear (MCWG)");
        form.put("residentialAddress", "Flat 402, Banjara Hills, Hyderabad");

        Application app = new Application("APP-GRP-A", citizen1, dlService, objectMapper.writeValueAsString(form), "en");
        app = applicationRepository.saveAndFlush(app);

        // 2. Upload ID Proof PDF matching form data
        String idText = "Government of India Identity Card\nFull Name: Ramesh Kumar\nDOB: 1995-05-15\nAadhaar: 2345 6789 0123\n";
        MockMultipartFile idFile = new MockMultipartFile("file", "aadhaar.pdf", "application/pdf", createTestPdf(idText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(idFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // 3. Upload Address Proof PDF
        String addressText = "Electricity Bill\nName: Ramesh Kumar\nAddress: Flat 402, Banjara Hills, Hyderabad\n";
        MockMultipartFile addressFile = new MockMultipartFile("file", "bill.pdf", "application/pdf", createTestPdf(addressText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(addressFile)
                        .param("documentTypeId", addressProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // 4. Trigger Pre-Screening Run
        MvcResult result = mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallStatus", is("PASSED")))
                .andExpect(jsonPath("$.failCount", is(0)))
                .andExpect(jsonPath("$.manualReviewCount", is(0)))
                .andExpect(jsonPath("$.passCount", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.extractions", hasSize(2)))
                .andReturn();

        PrescreeningSummaryResponse summary = objectMapper.readValue(result.getResponse().getContentAsString(), PrescreeningSummaryResponse.class);
        assertThat(summary.getAverageConfidence()).isGreaterThanOrEqualTo(new java.math.BigDecimal("0.9000"));

        // Verify status remained DRAFT (advisory nature)
        Application refreshedApp = applicationRepository.findById(app.getId()).orElseThrow();
        assertThat(refreshedApp.getStatus()).isEqualTo(ApplicationStatus.DRAFT);
    }

    @Test
    @DisplayName("Group B Evaluation: Missing required form fields and mandatory documents produce FAIL completeness findings")
    void testGroupBMissingFieldsAndDocuments() throws Exception {
        // Form missing residentialAddress and dateOfBirth
        Map<String, Object> form = new HashMap<>();
        form.put("fullName", "Ramesh Kumar");

        Application app = new Application("APP-GRP-B", citizen1, dlService, objectMapper.writeValueAsString(form), "en");
        app = applicationRepository.saveAndFlush(app);

        // No documents uploaded at all
        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallStatus", is("HAS_FAILS")))
                .andExpect(jsonPath("$.failCount", greaterThanOrEqualTo(2)))
                // Rule 1 Form Completeness finding
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_COMPLETENESS_FORM' && @.outcome == 'FAIL')]", not(empty())))
                // Rule 2 Document Completeness finding
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_COMPLETENESS_DOCS' && @.outcome == 'FAIL')]", not(empty())));
    }

    @Test
    @DisplayName("Group C Evaluation: Format and underage date of birth violations produce FAIL format findings")
    void testGroupCFormatAndAgeViolations() throws Exception {
        Map<String, Object> form = new HashMap<>();
        form.put("fullName", "Ramesh Kumar");
        // Underage applicant (e.g., 10 years old)
        form.put("dateOfBirth", "2016-01-01");
        // Invalid Aadhaar format (starts with 0, only 5 digits)
        form.put("aadhaarNumber", "01234");
        form.put("bloodGroup", "O+");
        form.put("vehicleType", "MCWG");
        form.put("residentialAddress", "Street 1");

        Application app = new Application("APP-GRP-C", citizen1, dlService, objectMapper.writeValueAsString(form), "en");
        app = applicationRepository.saveAndFlush(app);

        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallStatus", is("HAS_FAILS")))
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_FORMAT_AGE' && @.outcome == 'FAIL')]", not(empty())))
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_FORMAT_FIELDS' && @.outcome == 'FAIL')]", not(empty())));
    }

    @Test
    @DisplayName("Group D1 Evaluation: Minor typographical variation produces explainable WARNING with similarity percentage")
    void testGroupD1MinorNameSpellingVariationProducesWarning() throws Exception {
        Map<String, Object> form = new HashMap<>();
        form.put("fullName", "Ramesh Kumar");
        form.put("dateOfBirth", "1995-05-15");
        form.put("aadhaarNumber", "234567890123");
        form.put("bloodGroup", "O+");
        form.put("vehicleClass", "Motorcycle with Gear (MCWG)");
        form.put("residentialAddress", "Flat 402, Banjara Hills, Hyderabad");

        Application app = new Application("APP-GRP-D1", citizen1, dlService, objectMapper.writeValueAsString(form), "en");
        app = applicationRepository.saveAndFlush(app);

        // Document has "Ramesh K" (acceptable minor abbreviation/typo)
        String idText = "Identity Card\nFull Name: Ramesh K\nDOB: 1995-05-15\nAadhaar: 2345 6789 0123\n";
        MockMultipartFile idFile = new MockMultipartFile("file", "aadhaar.pdf", "application/pdf", createTestPdf(idText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(idFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // Address document
        String addressText = "Electricity Bill\nName: Ramesh Kumar\nAddress: Flat 402, Banjara Hills, Hyderabad\n";
        MockMultipartFile addressFile = new MockMultipartFile("file", "bill.pdf", "application/pdf", createTestPdf(addressText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(addressFile)
                        .param("documentTypeId", addressProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_MATCH_NAME' && @.outcome == 'WARNING')]", not(empty())))
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_MATCH_NAME')].explanation", hasItem(containsString("minor typographical variation"))));
    }

    @Test
    @DisplayName("Group D2 Evaluation: Name mismatch between form and identity document produces FAIL match finding")
    void testGroupD2NameMismatchProducesFail() throws Exception {
        Map<String, Object> form = new HashMap<>();
        form.put("fullName", "Ramesh Kumar");
        form.put("dateOfBirth", "1995-05-15");
        form.put("aadhaarNumber", "234567890123");

        Application app = new Application("APP-GRP-D2", citizen1, dlService, objectMapper.writeValueAsString(form), "en");
        app = applicationRepository.saveAndFlush(app);

        // Document belongs to completely different person
        String idText = "Identity Card\nFull Name: Suresh Chand Sharma\nDOB: 1995-05-15\nAadhaar: 2345 6789 0123\n";
        MockMultipartFile idFile = new MockMultipartFile("file", "aadhaar.pdf", "application/pdf", createTestPdf(idText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(idFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_MATCH_NAME' && @.outcome == 'FAIL')]", not(empty())))
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_MATCH_NAME')].explanation", contains(containsString("Applicant name mismatch"))));
    }

    @Test
    @DisplayName("Group E Evaluation: Degraded scan quality produces UNCERTAINTY flag routed for human manual review without penalty")
    void testGroupEDegradedScanQualityProducesUncertaintyFlag() throws Exception {
        Map<String, Object> form = new HashMap<>();
        form.put("fullName", "Ramesh Kumar");
        form.put("dateOfBirth", "1995-05-15");
        form.put("aadhaarNumber", "234567890123");
        form.put("bloodGroup", "O+");
        form.put("vehicleClass", "Motorcycle with Gear (MCWG)");
        form.put("residentialAddress", "Flat 402, Banjara Hills, Hyderabad");

        Application app = new Application("APP-GRP-E", citizen1, dlService, objectMapper.writeValueAsString(form), "en");
        app = applicationRepository.saveAndFlush(app);

        // Document marked with [DEGRADED_SCAN]
        String idText = "[DEGRADED_SCAN] Identity Card\nFull Name: Ramesh Kumar\nDOB: 1995-05-15\nAadhaar: 2345 6789 0123\n";
        MockMultipartFile idFile = new MockMultipartFile("file", "aadhaar.pdf", "application/pdf", createTestPdf(idText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(idFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // Upload address proof
        String addressText = "Electricity Bill\nName: Ramesh Kumar\nAddress: Flat 402, Banjara Hills, Hyderabad\n";
        MockMultipartFile addressFile = new MockMultipartFile("file", "bill.pdf", "application/pdf", createTestPdf(addressText));
        mockMvc.perform(multipart("/api/applications/" + app.getId() + "/documents")
                        .file(addressFile)
                        .param("documentTypeId", addressProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manualReviewCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.overallStatus", is("NEEDS_MANUAL_REVIEW")))
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_UNCERTAINTY_QUALITY' && @.outcome == 'NEEDS_MANUAL_REVIEW')]", not(empty())))
                .andExpect(jsonPath("$.findings[?(@.ruleCode == 'RULE_UNCERTAINTY_QUALITY')].explanation", hasItem(containsString("Flagged for human officer manual inspection without citizen penalty"))));
    }

    @Test
    @DisplayName("IDOR Defense: Citizen B cannot run or view pre-screening for Citizen A's application")
    void testCitizenIdorDefenseOnPrescreening() throws Exception {
        Application app = new Application("APP-IDOR-CHECK", citizen1, dlService, "{}", "en");
        app = applicationRepository.saveAndFlush(app);

        // Citizen B attempts run
        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen2Token))
                .andExpect(status().isForbidden());

        // Citizen B attempts view findings
        mockMvc.perform(get("/api/applications/" + app.getId() + "/prescreening/findings")
                        .header("Authorization", "Bearer " + citizen2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Department Boundary: Transport Officer can view pre-screening findings; Municipal Officer is denied 403")
    void testOfficerDepartmentIsolationOnPrescreening() throws Exception {
        Application app = new Application("APP-DEPT-OCR", citizen1, dlService, "{}", "en");
        app = applicationRepository.saveAndFlush(app);

        // Run pre-screening as citizen
        mockMvc.perform(post("/api/applications/" + app.getId() + "/prescreening/run")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk());

        // Transport officer -> 200 OK
        mockMvc.perform(get("/api/applications/" + app.getId() + "/prescreening/findings")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk());

        // Municipal officer -> 403 Forbidden
        mockMvc.perform(get("/api/applications/" + app.getId() + "/prescreening/findings")
                        .header("Authorization", "Bearer " + municipalOfficerToken))
                .andExpect(status().isForbidden());
    }
}
