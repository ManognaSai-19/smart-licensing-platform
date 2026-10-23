package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.*;
import com.licensing.platform.model.Department;
import com.licensing.platform.model.ServiceDefinition;
import com.licensing.platform.model.User;
import com.licensing.platform.model.enums.FieldDataType;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.DepartmentRepository;
import com.licensing.platform.repository.ServiceDefinitionRepository;
import com.licensing.platform.repository.UserRepository;
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

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ServiceCatalogueTest {

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String adminToken;
    private String citizenToken;
    private Long transportDeptId;
    private Long municipalDeptId;
    private Long drivingLicenseServiceId;

    @BeforeEach
    void setUp() {
        // Ensure Admin user
        User admin = userRepository.findByEmail("admin@licensing.gov.in")
                .orElseGet(() -> userRepository.saveAndFlush(new User(
                        "admin@licensing.gov.in",
                        passwordEncoder.encode("Admin@123"),
                        "System Administrator",
                        Role.ADMIN,
                        "9999999999"
                )));
        adminToken = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);

        // Ensure Citizen user
        User citizen = userRepository.findByEmail("citizen.catalog@test.com")
                .orElseGet(() -> userRepository.saveAndFlush(new User(
                        "citizen.catalog@test.com",
                        passwordEncoder.encode("Password@123"),
                        "Test Citizen",
                        Role.CITIZEN,
                        "9876543210"
                )));
        citizenToken = tokenProvider.generateToken(citizen.getId(), citizen.getEmail(), citizen.getRole(), 3600000);

        // Resolve seeded IDs
        Department transport = departmentRepository.findByCode("DEPT_TRANSPORT").orElseThrow();
        transportDeptId = transport.getId();

        Department municipal = departmentRepository.findByCode("DEPT_MUNICIPAL").orElseThrow();
        municipalDeptId = municipal.getId();

        ServiceDefinition drivingService = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();
        drivingLicenseServiceId = drivingService.getId();
    }

    // =================================================================
    // 1. PUBLIC DEPARTMENT ENDPOINTS
    // =================================================================

    @Test
    @DisplayName("Public can list all departments with service counts")
    void testGetAllDepartmentsPublic() throws Exception {
        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].code", hasItems("DEPT_TRANSPORT", "DEPT_MUNICIPAL")))
                .andExpect(jsonPath("$[0].serviceCount", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Public can get department by ID")
    void testGetDepartmentById() throws Exception {
        mockMvc.perform(get("/api/departments/" + transportDeptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("DEPT_TRANSPORT")))
                .andExpect(jsonPath("$.name", is("Department of Transport")))
                .andExpect(jsonPath("$.serviceCount", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Get non-existent department returns 404")
    void testGetDepartmentNotFoundReturns404() throws Exception {
        mockMvc.perform(get("/api/departments/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("Department not found")));
    }

    // =================================================================
    // 2. PUBLIC SERVICE CATALOGUE ENDPOINTS
    // =================================================================

    @Test
    @DisplayName("Public can list all active services")
    void testGetAllServicesPublic() throws Exception {
        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].code", hasItems("SRV_DRIVING_LICENSE", "SRV_TRADE_LICENSE")))
                .andExpect(jsonPath("$[0].departmentCode", notNullValue()))
                .andExpect(jsonPath("$[0].fieldCount", greaterThan(0)))
                .andExpect(jsonPath("$[0].documentCount", greaterThan(0)));
    }

    @Test
    @DisplayName("Public can filter services by department ID")
    void testFilterServicesByDepartment() throws Exception {
        mockMvc.perform(get("/api/services")
                        .param("departmentId", transportDeptId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].departmentCode", everyItem(is("DEPT_TRANSPORT"))));
    }

    @Test
    @DisplayName("Public can search services by text query")
    void testSearchServicesByQuery() throws Exception {
        mockMvc.perform(get("/api/services")
                        .param("query", "driving"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].code", is("SRV_DRIVING_LICENSE")));
    }

    @Test
    @DisplayName("Public can get complete service definition with ordered bilingual fields and required documents")
    void testGetServiceByIdWithFieldsAndDocuments() throws Exception {
        mockMvc.perform(get("/api/services/" + drivingLicenseServiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("SRV_DRIVING_LICENSE")))
                .andExpect(jsonPath("$.name", is("Learner & Permanent Driving License")))
                .andExpect(jsonPath("$.sampleFee", is(500.0)))
                .andExpect(jsonPath("$.processingTimeDays", is(14)))
                .andExpect(jsonPath("$.fields", hasSize(6)))
                // Verify display order and bilingual labels
                .andExpect(jsonPath("$.fields[0].fieldKey", is("fullName")))
                .andExpect(jsonPath("$.fields[0].labelEn", is("Full Name (as per ID proof)")))
                .andExpect(jsonPath("$.fields[0].labelTe", notNullValue()))
                .andExpect(jsonPath("$.fields[0].dataType", is("TEXT")))
                .andExpect(jsonPath("$.fields[0].required", is(true)))
                // Verify required documents
                .andExpect(jsonPath("$.requiredDocuments", hasSize(3)))
                .andExpect(jsonPath("$.requiredDocuments[*].documentCode", hasItems("DOC_ID_PROOF", "DOC_ADDRESS_PROOF", "DOC_MEDICAL_FITNESS")));
    }

    @Test
    @DisplayName("Public can get service by unique service code")
    void testGetServiceByCode() throws Exception {
        mockMvc.perform(get("/api/services/code/SRV_TRADE_LICENSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("SRV_TRADE_LICENSE")))
                .andExpect(jsonPath("$.departmentCode", is("DEPT_MUNICIPAL")))
                .andExpect(jsonPath("$.fields", hasSize(6)))
                .andExpect(jsonPath("$.requiredDocuments", hasSize(3)));
    }

    @Test
    @DisplayName("Get non-existent service returns 404")
    void testGetServiceNotFoundReturns404() throws Exception {
        mockMvc.perform(get("/api/services/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    // =================================================================
    // 3. ADMIN ACCESS CONTROL & MUTATION ENDPOINTS
    // =================================================================

    @Test
    @DisplayName("Anonymous user cannot create service (401 Unauthorized)")
    void testCreateServiceWithoutAuthReturns401() throws Exception {
        ServiceCreateRequest req = new ServiceCreateRequest(
                "SRV_NO_AUTH", "No Auth Service", "Test", transportDeptId, BigDecimal.valueOf(100), 5, true
        );

        mockMvc.perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Citizen cannot create service (403 Forbidden)")
    void testCreateServiceAsCitizenReturns403() throws Exception {
        ServiceCreateRequest req = new ServiceCreateRequest(
                "SRV_CITIZEN_ATTEMPT", "Citizen Service", "Test", transportDeptId, BigDecimal.valueOf(100), 5, true
        );

        mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can create new service with dynamic fields and documents")
    void testCreateServiceAsAdminSuccess() throws Exception {
        String uniqueCode = "SRV_FOOD_SAFETY_" + System.currentTimeMillis();

        ServiceCreateRequest req = new ServiceCreateRequest(
                uniqueCode,
                "Food Safety & Hygiene License",
                "Licensing for eateries and food packaging establishments.",
                municipalDeptId,
                BigDecimal.valueOf(750.00),
                10,
                true
        );

        ServiceFieldRequest field1 = new ServiceFieldRequest(
                "kitchenAreaSqFt", "Kitchen Floor Area (Sq. Ft)", "వంటగది వైశాల్యం (చ.అ.)",
                FieldDataType.NUMBER, true, "{\"min\":50}", null, 1
        );
        req.setFields(List.of(field1));

        RequiredDocumentTypeRequest doc1 = new RequiredDocumentTypeRequest(
                "DOC_WATER_TEST", "Potable Water Test Report", "తాగునీటి పరీక్ష నివేదిక",
                true, "application/pdf,image/jpeg", 5242880L
        );
        req.setRequiredDocuments(List.of(doc1));

        mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is(uniqueCode)))
                .andExpect(jsonPath("$.name", is("Food Safety & Hygiene License")))
                .andExpect(jsonPath("$.sampleFee", is(750.0)))
                .andExpect(jsonPath("$.fields", hasSize(1)))
                .andExpect(jsonPath("$.fields[0].fieldKey", is("kitchenAreaSqFt")))
                .andExpect(jsonPath("$.requiredDocuments", hasSize(1)))
                .andExpect(jsonPath("$.requiredDocuments[0].documentCode", is("DOC_WATER_TEST")));
    }

    @Test
    @DisplayName("Admin creating service with duplicate code returns 409 Conflict")
    void testCreateServiceDuplicateCodeReturns409() throws Exception {
        ServiceCreateRequest req = new ServiceCreateRequest(
                "SRV_DRIVING_LICENSE", // Existing code
                "Duplicate License",
                "Testing duplicate code rejection",
                transportDeptId,
                BigDecimal.valueOf(200.00),
                7,
                true
        );

        mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("Conflict")))
                .andExpect(jsonPath("$.message", containsString("already exists with code")));
    }

    @Test
    @DisplayName("Admin can update service details, fee, and processing time")
    void testUpdateServiceAsAdmin() throws Exception {
        // Create a test service to update
        String uniqueCode = "SRV_UPDATE_TEST_" + System.currentTimeMillis();
        ServiceCreateRequest createReq = new ServiceCreateRequest(
                uniqueCode, "Initial Name", "Initial Desc", transportDeptId, BigDecimal.valueOf(100), 5, true
        );

        MvcResult createResult = mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ServiceDetailResponse created = objectMapper.readValue(createResult.getResponse().getContentAsString(), ServiceDetailResponse.class);

        // Update it
        ServiceUpdateRequest updateReq = new ServiceUpdateRequest(
                "Updated Service Name", "Updated Description", transportDeptId, BigDecimal.valueOf(250.00), 9, true
        );

        mockMvc.perform(put("/api/services/" + created.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Service Name")))
                .andExpect(jsonPath("$.description", is("Updated Description")))
                .andExpect(jsonPath("$.sampleFee", is(250.0)))
                .andExpect(jsonPath("$.processingTimeDays", is(9)));
    }

    @Test
    @DisplayName("Admin can add, update, and delete dynamic fields on an existing service")
    void testManageDynamicFieldsAsAdmin() throws Exception {
        // 1. Create a service
        String uniqueCode = "SRV_FIELD_TEST_" + System.currentTimeMillis();
        ServiceCreateRequest createReq = new ServiceCreateRequest(
                uniqueCode, "Field Test Service", "Testing dynamic field management",
                transportDeptId, BigDecimal.valueOf(50), 3, true
        );
        MvcResult srvResult = mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ServiceDetailResponse srv = objectMapper.readValue(srvResult.getResponse().getContentAsString(), ServiceDetailResponse.class);
        Long serviceId = srv.getId();

        // 2. Add field
        ServiceFieldRequest addFieldReq = new ServiceFieldRequest(
                "chassisNumber", "Vehicle Chassis Number", "వాహనం చాసిస్ సంఖ్య",
                FieldDataType.TEXT, true, "{\"minLength\":10}", null, 1
        );
        MvcResult addFieldResult = mockMvc.perform(post("/api/services/" + serviceId + "/fields")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addFieldReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fieldKey", is("chassisNumber")))
                .andExpect(jsonPath("$.labelEn", is("Vehicle Chassis Number")))
                .andReturn();
        ServiceFieldResponse addedField = objectMapper.readValue(addFieldResult.getResponse().getContentAsString(), ServiceFieldResponse.class);
        Long fieldId = addedField.getId();

        // 3. Update field
        ServiceFieldRequest updateFieldReq = new ServiceFieldRequest(
                "chassisNumber", "Updated Chassis Number Label", "నవీకరించబడిన చాసిస్ సంఖ్య",
                FieldDataType.TEXT, true, "{\"minLength\":12}", null, 1
        );
        mockMvc.perform(put("/api/services/" + serviceId + "/fields/" + fieldId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateFieldReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.labelEn", is("Updated Chassis Number Label")));

        // 4. Delete field
        mockMvc.perform(delete("/api/services/" + serviceId + "/fields/" + fieldId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Verify field is deleted
        mockMvc.perform(get("/api/services/" + serviceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fields", hasSize(0)));
    }

    @Test
    @DisplayName("Admin can add and delete required document specifications")
    void testManageRequiredDocumentsAsAdmin() throws Exception {
        // 1. Create a service
        String uniqueCode = "SRV_DOC_TEST_" + System.currentTimeMillis();
        ServiceCreateRequest createReq = new ServiceCreateRequest(
                uniqueCode, "Document Test Service", "Testing required document management",
                municipalDeptId, BigDecimal.valueOf(100), 5, true
        );
        MvcResult srvResult = mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ServiceDetailResponse srv = objectMapper.readValue(srvResult.getResponse().getContentAsString(), ServiceDetailResponse.class);
        Long serviceId = srv.getId();

        // 2. Add required document
        RequiredDocumentTypeRequest addDocReq = new RequiredDocumentTypeRequest(
                "DOC_POLLUTION_CERT", "Pollution Under Control (PUC) Certificate", "కాలుష్య నియంత్రణ పత్రం",
                true, "application/pdf,image/jpeg", 2097152L
        );
        MvcResult addDocResult = mockMvc.perform(post("/api/services/" + serviceId + "/documents")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addDocReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.documentCode", is("DOC_POLLUTION_CERT")))
                .andReturn();
        RequiredDocumentTypeResponse addedDoc = objectMapper.readValue(addDocResult.getResponse().getContentAsString(), RequiredDocumentTypeResponse.class);
        Long docId = addedDoc.getId();

        // 3. Delete document
        mockMvc.perform(delete("/api/services/" + serviceId + "/documents/" + docId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Verify document is deleted
        mockMvc.perform(get("/api/services/" + serviceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiredDocuments", hasSize(0)));
    }

    @Test
    @DisplayName("Admin can deactivate service (soft delete)")
    void testDeactivateServiceAsAdmin() throws Exception {
        // Create service
        String uniqueCode = "SRV_DEACTIVATE_" + System.currentTimeMillis();
        ServiceCreateRequest createReq = new ServiceCreateRequest(
                uniqueCode, "To Be Deactivated", "Deactivation test", transportDeptId, BigDecimal.valueOf(50), 2, true
        );
        MvcResult srvResult = mockMvc.perform(post("/api/services")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        ServiceDetailResponse srv = objectMapper.readValue(srvResult.getResponse().getContentAsString(), ServiceDetailResponse.class);

        // Deactivate
        mockMvc.perform(delete("/api/services/" + srv.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Verify it disappears from public active listing
        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].code", not(hasItem(uniqueCode))));

        // Verify it is still visible with activeOnly=false
        mockMvc.perform(get("/api/services").param("activeOnly", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].code", hasItem(uniqueCode)));
    }

    @Test
    @DisplayName("Admin can create new department")
    void testCreateDepartmentAsAdmin() throws Exception {
        String deptCode = "DEPT_REVENUE_" + System.currentTimeMillis();
        DepartmentRequest req = new DepartmentRequest(deptCode, "Department of Revenue & Land Records", "Handles patta, khata, and land registrations");

        mockMvc.perform(post("/api/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", is(deptCode)))
                .andExpect(jsonPath("$.name", is("Department of Revenue & Land Records")));
    }
}
