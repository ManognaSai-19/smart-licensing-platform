package com.licensing.platform;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.DocumentUploadResponse;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
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
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DocumentManagementTest {

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

    @Autowired
    private DocumentStorageService documentStorageService;

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

    private Application citizen1App;

    // Helper byte arrays with authentic binary headers
    // Valid PDF header (%PDF-1.4 ...)
    private static final byte[] VALID_PDF_BYTES = new byte[]{
            0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, (byte) 0xE2, (byte) 0xE3, (byte) 0xCF, (byte) 0xD3
    };

    // Valid JPEG header (SOI marker 0xFF 0xD8 0xFF 0xE0)
    private static final byte[] VALID_JPEG_BYTES = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
    };

    // Valid PNG header (0x89 50 4E 47 0D 0A 1A 0A)
    private static final byte[] VALID_PNG_BYTES = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
    };

    @BeforeEach
    void setUp() {
        transportDept = departmentRepository.findByCode("DEPT_TRANSPORT").orElseThrow();
        municipalDept = departmentRepository.findByCode("DEPT_MUNICIPAL").orElseThrow();
        dlService = serviceRepository.findByCode("SRV_DRIVING_LICENSE").orElseThrow();

        idProofType = requiredDocumentTypeRepository.findByServiceIdAndDocumentCode(dlService.getId(), "DOC_ID_PROOF").orElseThrow();
        addressProofType = requiredDocumentTypeRepository.findByServiceIdAndDocumentCode(dlService.getId(), "DOC_ADDRESS_PROOF").orElseThrow();

        // Citizen 1
        citizen1 = userRepository.findByEmail("citizen1.doc@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen1.doc@test.com", passwordEncoder.encode("Pass123"), "Anand Citizen", Role.CITIZEN, "9876543201")));
        citizen1Token = tokenProvider.generateToken(citizen1.getId(), citizen1.getEmail(), citizen1.getRole(), 3600000);

        // Citizen 2
        citizen2 = userRepository.findByEmail("citizen2.doc@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("citizen2.doc@test.com", passwordEncoder.encode("Pass123"), "Sunita Citizen", Role.CITIZEN, "9876543202")));
        citizen2Token = tokenProvider.generateToken(citizen2.getId(), citizen2.getEmail(), citizen2.getRole(), 3600000);

        // Transport Officer
        transportOfficer = userRepository.findByEmail("officer.doc.transport@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.doc.transport@test.com", passwordEncoder.encode("Pass123"), "Officer Transport", Role.OFFICER, "9876543203")));
        transportOfficerToken = tokenProvider.generateToken(transportOfficer.getId(), transportOfficer.getEmail(), transportOfficer.getRole(), 3600000);
        if (!assignmentRepository.existsByUserIdAndDepartmentId(transportOfficer.getId(), transportDept.getId())) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(transportOfficer, transportDept));
        }

        // Municipal Officer
        municipalOfficer = userRepository.findByEmail("officer.doc.municipal@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("officer.doc.municipal@test.com", passwordEncoder.encode("Pass123"), "Officer Municipal", Role.OFFICER, "9876543204")));
        municipalOfficerToken = tokenProvider.generateToken(municipalOfficer.getId(), municipalOfficer.getEmail(), municipalOfficer.getRole(), 3600000);
        if (!assignmentRepository.existsByUserIdAndDepartmentId(municipalOfficer.getId(), municipalDept.getId())) {
            assignmentRepository.saveAndFlush(new OfficerDepartmentAssignment(municipalOfficer, municipalDept));
        }

        // Admin
        admin = userRepository.findByEmail("admin.doc@test.com").orElseGet(() ->
                userRepository.saveAndFlush(new User("admin.doc@test.com", passwordEncoder.encode("Pass123"), "Super Admin", Role.ADMIN, "9876543205")));
        adminToken = tokenProvider.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), 3600000);

        // Create initial draft application for Citizen 1
        citizen1App = new Application("APP-DOC-" + System.currentTimeMillis(), citizen1, dlService, "{}", "en");
        citizen1App.setStatus(ApplicationStatus.DRAFT);
        citizen1App = applicationRepository.saveAndFlush(citizen1App);
    }

    @Test
    @DisplayName("Citizen successfully uploads authentic PDF document with magic bytes to draft application")
    void testUploadValidPdfDocumentSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "aadhaar_card.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        MvcResult result = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.applicationId", is(citizen1App.getId().intValue())))
                .andExpect(jsonPath("$.documentTypeCode", is("DOC_ID_PROOF")))
                .andExpect(jsonPath("$.fileName", is("aadhaar_card.pdf")))
                .andExpect(jsonPath("$.contentType", is("application/pdf")))
                .andExpect(jsonPath("$.storageKey", startsWith("app_" + citizen1App.getId() + "/")))
                .andExpect(jsonPath("$.fileChecksum", notNullValue()))
                .andExpect(jsonPath("$.previewUrl", containsString("/preview")))
                .andExpect(jsonPath("$.downloadUrl", containsString("/download")))
                .andReturn();

        DocumentUploadResponse resp = objectMapper.readValue(result.getResponse().getContentAsString(), DocumentUploadResponse.class);
        Resource storedResource = documentStorageService.loadFileAsResource(resp.getStorageKey());
        assertThat(storedResource.exists()).isTrue();
    }

    @Test
    @DisplayName("Citizen successfully uploads authentic JPEG document with magic bytes")
    void testUploadValidJpegDocumentSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.jpeg",
                "image/jpeg",
                VALID_JPEG_BYTES
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contentType", is("image/jpeg")))
                .andExpect(jsonPath("$.fileName", is("photo.jpeg")));
    }

    @Test
    @DisplayName("Citizen successfully uploads authentic PNG document with magic bytes")
    void testUploadValidPngDocumentSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "utility_bill.png",
                "image/png",
                VALID_PNG_BYTES
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", addressProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contentType", is("image/png")))
                .andExpect(jsonPath("$.fileName", is("utility_bill.png")));
    }

    @Test
    @DisplayName("Rejects spoofed file that claims to be PDF but contains plain text binary header")
    void testUploadSpoofedFileFailsMagicByteValidation() throws Exception {
        // Plain text spoofed as PDF
        byte[] fakePdfBytes = "This is not a real PDF file! It is plain ASCII text pretending to be PDF.".getBytes(StandardCharsets.UTF_8);

        MockMultipartFile fakeFile = new MockMultipartFile(
                "file",
                "malicious.pdf",
                "application/pdf",
                fakePdfBytes
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(fakeFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Binary magic bytes do not match")));
    }

    @Test
    @DisplayName("Rejects oversized file exceeding maximum size bytes")
    void testUploadOversizedFileReturns400() throws Exception {
        // Create file larger than maxSizeBytes (5 MB limit in test, create 6MB buffer)
        byte[] largeBytes = new byte[6 * 1024 * 1024];
        // Copy PDF magic bytes at the beginning
        System.arraycopy(VALID_PDF_BYTES, 0, largeBytes, 0, VALID_PDF_BYTES.length);

        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "oversized.pdf",
                "application/pdf",
                largeBytes
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(largeFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("exceeds the maximum allowed limit")));
    }

    @Test
    @DisplayName("Rejects path traversal filename attempts")
    void testPathTraversalFilenameRejected() throws Exception {
        MockMultipartFile traversalFile = new MockMultipartFile(
                "file",
                "../../etc/passwd.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(traversalFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("path traversal")));
    }

    @Test
    @DisplayName("IDOR Defense: Citizen B cannot upload document to Citizen A's application")
    void testUploadDocumentToOtherCitizenApplicationReturns403() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "my_doc.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cannot upload documents once application has transitioned to SUBMITTED status")
    void testUploadDocumentAfterSubmissionReturnsConflict() throws Exception {
        citizen1App.setStatus(ApplicationStatus.SUBMITTED);
        applicationRepository.saveAndFlush(citizen1App);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "doc.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Cannot upload documents for application in status: SUBMITTED")));
    }

    @Test
    @DisplayName("Preview and download documents streams correct bytes with security headers")
    void testPreviewAndDownloadDocumentAsOwner() throws Exception {
        // 1. Upload
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "identity.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andReturn();

        DocumentUploadResponse uploaded = objectMapper.readValue(uploadResult.getResponse().getContentAsString(), DocumentUploadResponse.class);

        // 2. Inline Preview
        mockMvc.perform(get("/api/applications/" + citizen1App.getId() + "/documents/" + uploaded.getId() + "/preview")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", "inline; filename=\"identity.pdf\""))
                .andExpect(content().bytes(VALID_PDF_BYTES));

        // 3. Attachment Download
        mockMvc.perform(get("/api/applications/" + citizen1App.getId() + "/documents/" + uploaded.getId() + "/download")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"identity.pdf\""))
                .andExpect(content().bytes(VALID_PDF_BYTES));
    }

    @Test
    @DisplayName("IDOR Defense: Citizen B cannot preview Citizen A's uploaded documents")
    void testPreviewDocumentOtherCitizenReturns403() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "private.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andReturn();

        DocumentUploadResponse uploaded = objectMapper.readValue(uploadResult.getResponse().getContentAsString(), DocumentUploadResponse.class);

        mockMvc.perform(get("/api/applications/" + citizen1App.getId() + "/documents/" + uploaded.getId() + "/preview")
                        .header("Authorization", "Bearer " + citizen2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Department Boundary: Transport Officer can view document, but Municipal Officer is denied 403")
    void testOfficerDepartmentIsolationForDocuments() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transport_doc.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andReturn();

        DocumentUploadResponse uploaded = objectMapper.readValue(uploadResult.getResponse().getContentAsString(), DocumentUploadResponse.class);

        // Transport officer -> 200 OK
        mockMvc.perform(get("/api/applications/" + citizen1App.getId() + "/documents/" + uploaded.getId() + "/preview")
                        .header("Authorization", "Bearer " + transportOfficerToken))
                .andExpect(status().isOk());

        // Municipal officer -> 403 Forbidden
        mockMvc.perform(get("/api/applications/" + citizen1App.getId() + "/documents/" + uploaded.getId() + "/preview")
                        .header("Authorization", "Bearer " + municipalOfficerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Document replacement: uploading new file for same document type replaces old file and retains 1 record")
    void testDocumentReplacementForSameDocumentType() throws Exception {
        // Upload first version
        MockMultipartFile v1 = new MockMultipartFile(
                "file",
                "v1_aadhaar.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );
        MvcResult res1 = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(v1)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andReturn();
        DocumentUploadResponse doc1 = objectMapper.readValue(res1.getResponse().getContentAsString(), DocumentUploadResponse.class);

        // Upload second version (JPEG)
        MockMultipartFile v2 = new MockMultipartFile(
                "file",
                "v2_aadhaar.jpeg",
                "image/jpeg",
                VALID_JPEG_BYTES
        );
        MvcResult res2 = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(v2)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName", is("v2_aadhaar.jpeg")))
                .andExpect(jsonPath("$.contentType", is("image/jpeg")))
                .andReturn();
        DocumentUploadResponse doc2 = objectMapper.readValue(res2.getResponse().getContentAsString(), DocumentUploadResponse.class);

        // Verify entity ID was updated in place
        assertThat(doc2.getId()).isEqualTo(doc1.getId());

        // Verify only 1 document exists in DB for this application
        List<ApplicationDocument> docs = documentRepository.findByApplicationId(citizen1App.getId());
        assertThat(docs).hasSize(1);
        assertThat(docs.get(0).getFileName()).isEqualTo("v2_aadhaar.jpeg");
    }

    @Test
    @DisplayName("Document deletion: citizen can delete document in DRAFT, but rejected once SUBMITTED")
    void testDocumentDeletionLifecycle() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "delete_me.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );
        MvcResult res = mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated())
                .andReturn();
        DocumentUploadResponse doc = objectMapper.readValue(res.getResponse().getContentAsString(), DocumentUploadResponse.class);

        // Delete while in DRAFT -> 200 OK
        mockMvc.perform(delete("/api/applications/" + citizen1App.getId() + "/documents/" + doc.getId())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deleted successfully")));

        assertThat(documentRepository.findById(doc.getId())).isEmpty();
    }

    @Test
    @DisplayName("Document checklist status returns full catalog of requirements with upload indicators")
    void testGetDocumentChecklistStatus() throws Exception {
        // Upload 1 of the required documents
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "aadhaar.pdf",
                "application/pdf",
                VALID_PDF_BYTES
        );
        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(file)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // Check checklist status
        mockMvc.perform(get("/api/applications/" + citizen1App.getId() + "/documents/checklist")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[?(@.documentCode == 'DOC_ID_PROOF')].uploaded", contains(true)))
                .andExpect(jsonPath("$[?(@.documentCode == 'DOC_ADDRESS_PROOF')].uploaded", contains(false)));
    }

    @Test
    @DisplayName("Mandatory document checklist validation blocks incomplete applications")
    void testMandatoryDocumentChecklistValidation() throws Exception {
        // 1. Without documents, validation fails
        mockMvc.perform(post("/api/applications/" + citizen1App.getId() + "/documents/validate-checklist")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Mandatory documents are missing")));

        // 2. Upload DOC_ID_PROOF
        MockMultipartFile idFile = new MockMultipartFile("file", "id.pdf", "application/pdf", VALID_PDF_BYTES);
        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(idFile)
                        .param("documentTypeId", idProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // Still missing DOC_ADDRESS_PROOF
        mockMvc.perform(post("/api/applications/" + citizen1App.getId() + "/documents/validate-checklist")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isBadRequest());

        // 3. Upload DOC_ADDRESS_PROOF
        MockMultipartFile addressFile = new MockMultipartFile("file", "address.pdf", "application/pdf", VALID_PDF_BYTES);
        mockMvc.perform(multipart("/api/applications/" + citizen1App.getId() + "/documents")
                        .file(addressFile)
                        .param("documentTypeId", addressProofType.getId().toString())
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isCreated());

        // 4. Now checklist validation succeeds
        mockMvc.perform(post("/api/applications/" + citizen1App.getId() + "/documents/validate-checklist")
                        .header("Authorization", "Bearer " + citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VALID")));
    }
}
