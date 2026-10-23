package com.licensing.platform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.OcrExtractionResponse;
import com.licensing.platform.dto.PrescreeningFindingResponse;
import com.licensing.platform.dto.PrescreeningSummaryResponse;
import com.licensing.platform.exception.ResourceNotFoundException;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.FindingOutcome;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.ocr.OcrOrchestratorService;
import com.licensing.platform.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescreeningEngineService {

    private static final Logger log = LoggerFactory.getLogger(PrescreeningEngineService.class);

    private final ApplicationRepository applicationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final ServiceFieldRepository serviceFieldRepository;
    private final RequiredDocumentTypeRepository requiredDocumentTypeRepository;
    private final OcrExtractionRepository ocrExtractionRepository;
    private final PrescreeningFindingRepository findingRepository;
    private final UserRepository userRepository;
    private final OfficerDepartmentAssignmentRepository assignmentRepository;
    private final OcrOrchestratorService ocrOrchestratorService;
    private final ObjectMapper objectMapper;

    public PrescreeningEngineService(ApplicationRepository applicationRepository,
                                     ApplicationDocumentRepository documentRepository,
                                     ServiceFieldRepository serviceFieldRepository,
                                     RequiredDocumentTypeRepository requiredDocumentTypeRepository,
                                     OcrExtractionRepository ocrExtractionRepository,
                                     PrescreeningFindingRepository findingRepository,
                                     UserRepository userRepository,
                                     OfficerDepartmentAssignmentRepository assignmentRepository,
                                     OcrOrchestratorService ocrOrchestratorService,
                                     ObjectMapper objectMapper) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.serviceFieldRepository = serviceFieldRepository;
        this.requiredDocumentTypeRepository = requiredDocumentTypeRepository;
        this.ocrExtractionRepository = ocrExtractionRepository;
        this.findingRepository = findingRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.ocrOrchestratorService = ocrOrchestratorService;
        this.objectMapper = objectMapper;
    }

    /**
     * Executes OCR extraction on all uploaded documents and evaluates explainable
     * pre-screening rules across Completeness, Format, Match, and Uncertainty categories.
     */
    public PrescreeningSummaryResponse runPrescreening(Long applicationId, Long userId, Role role) {
        Application application = getApplicationOrThrow(applicationId);
        checkAccess(application, userId, role);

        log.info("Running explainable pre-screening for application ID {}", applicationId);

        // 1. Fetch form data and catalog requirements
        Map<String, Object> formData = deserializeFormData(application.getFormData());
        List<ServiceField> fields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(application.getService().getId());
        List<RequiredDocumentType> requiredDocTypes = requiredDocumentTypeRepository.findByServiceId(application.getService().getId());
        List<ApplicationDocument> uploadedDocs = documentRepository.findByApplicationId(applicationId);

        // 2. Clear old findings for a clean fresh evaluation run
        findingRepository.deleteByApplicationId(applicationId);
        findingRepository.flush();

        // 3. Run OCR extraction on each document
        List<OcrExtraction> extractions = new ArrayList<>();
        Map<Long, Map<String, String>> documentExtractedFieldsMap = new HashMap<>();

        for (ApplicationDocument doc : uploadedDocs) {
            OcrExtraction extraction = ocrOrchestratorService.processDocument(doc);
            extractions.add(extraction);
            Map<String, String> extractedMap = parseExtractedFields(extraction.getExtractedFields());
            documentExtractedFieldsMap.put(doc.getId(), extractedMap);
        }

        List<PrescreeningFinding> findings = new ArrayList<>();

        // ---------------------------------------------------------------------
        // RULE 1: FORM FIELD COMPLETENESS (RULE_COMPLETENESS_FORM)
        // ---------------------------------------------------------------------
        for (ServiceField field : fields) {
            if (field.isRequired()) {
                Object val = formData.get(field.getFieldKey());
                boolean isFilled = val != null && !val.toString().trim().isEmpty();

                if (!isFilled) {
                    findings.add(new PrescreeningFinding(
                            application, null, "RULE_COMPLETENESS_FORM", field.getFieldKey(),
                            FindingOutcome.FAIL, "Non-empty value", "MISSING",
                            "Required form field '" + field.getLabelEn() + "' is missing from the application.",
                            "Please enter a valid " + field.getLabelEn() + " in the application form.",
                            BigDecimal.valueOf(1.0000)
                    ));
                } else {
                    findings.add(new PrescreeningFinding(
                            application, null, "RULE_COMPLETENESS_FORM", field.getFieldKey(),
                            FindingOutcome.PASS, "Non-empty value", val.toString().trim(),
                            "Required form field '" + field.getLabelEn() + "' is provided.",
                            "No action needed.",
                            BigDecimal.valueOf(1.0000)
                    ));
                }
            }
        }

        // ---------------------------------------------------------------------
        // RULE 2: DOCUMENT COMPLETENESS (RULE_COMPLETENESS_DOCS)
        // ---------------------------------------------------------------------
        Map<Long, ApplicationDocument> docsByTypeId = uploadedDocs.stream()
                .collect(Collectors.toMap(d -> d.getDocumentType().getId(), d -> d, (d1, d2) -> d1));

        for (RequiredDocumentType docType : requiredDocTypes) {
            if (docType.isRequired()) {
                ApplicationDocument uploaded = docsByTypeId.get(docType.getId());
                if (uploaded == null) {
                    findings.add(new PrescreeningFinding(
                            application, null, "RULE_COMPLETENESS_DOCS", docType.getDocumentCode(),
                            FindingOutcome.FAIL, docType.getNameEn() + " (Attached)", "NOT_ATTACHED",
                            "Mandatory supporting document '" + docType.getNameEn() + "' has not been uploaded.",
                            "Please upload your " + docType.getNameEn() + " before final submission.",
                            BigDecimal.valueOf(1.0000)
                    ));
                } else {
                    findings.add(new PrescreeningFinding(
                            application, uploaded, "RULE_COMPLETENESS_DOCS", docType.getDocumentCode(),
                            FindingOutcome.PASS, docType.getNameEn() + " (Attached)", uploaded.getFileName(),
                            "Mandatory supporting document '" + docType.getNameEn() + "' is attached.",
                            "No action needed.",
                            BigDecimal.valueOf(1.0000)
                    ));
                }
            }
        }

        // ---------------------------------------------------------------------
        // RULE 3: FORM FIELD FORMAT VALIDITY (RULE_FORMAT_FIELDS & RULE_FORMAT_AGE)
        // ---------------------------------------------------------------------
        for (ServiceField field : fields) {
            Object val = formData.get(field.getFieldKey());
            if (val != null && !val.toString().trim().isEmpty() && field.getValidationRules() != null) {
                try {
                    JsonNode rules = objectMapper.readTree(field.getValidationRules());

                    // Regex check
                    if (rules.has("regex")) {
                        String regex = rules.get("regex").asText();
                        boolean matches = Pattern.compile(regex).matcher(val.toString().trim()).matches();
                        if (!matches) {
                            findings.add(new PrescreeningFinding(
                                    application, null, "RULE_FORMAT_FIELDS", field.getFieldKey(),
                                    FindingOutcome.FAIL, "Pattern: " + regex, val.toString().trim(),
                                    "Field '" + field.getLabelEn() + "' does not match standard government formatting format.",
                                    "Check and correct the format of " + field.getLabelEn() + ".",
                                    BigDecimal.valueOf(1.0000)
                            ));
                        } else {
                            findings.add(new PrescreeningFinding(
                                    application, null, "RULE_FORMAT_FIELDS", field.getFieldKey(),
                                    FindingOutcome.PASS, "Pattern: " + regex, val.toString().trim(),
                                    "Field '" + field.getLabelEn() + "' conforms to required format.",
                                    "No action needed.",
                                    BigDecimal.valueOf(1.0000)
                            ));
                        }
                    }

                    // Minimum Age check
                    if (rules.has("minAgeYears")) {
                        int minAge = rules.get("minAgeYears").asInt();
                        try {
                            LocalDate dob = LocalDate.parse(val.toString().trim());
                            int age = Period.between(dob, LocalDate.now()).getYears();
                            if (age < minAge) {
                                findings.add(new PrescreeningFinding(
                                        application, null, "RULE_FORMAT_AGE", field.getFieldKey(),
                                        FindingOutcome.FAIL, "Age >= " + minAge, "Current Age: " + age,
                                        "Applicant age (" + age + " years) does not meet the minimum eligibility requirement of " + minAge + " years.",
                                        "Applications require applicant to be at least " + minAge + " years of age.",
                                        BigDecimal.valueOf(1.0000)
                                ));
                            } else {
                                findings.add(new PrescreeningFinding(
                                        application, null, "RULE_FORMAT_AGE", field.getFieldKey(),
                                        FindingOutcome.PASS, "Age >= " + minAge, "Current Age: " + age,
                                        "Applicant age requirement satisfied (" + age + " years old).",
                                        "No action needed.",
                                        BigDecimal.valueOf(1.0000)
                                ));
                            }
                        } catch (Exception ignored) {
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to evaluate format rule JSON for field {}", field.getFieldKey(), e);
                }
            }
        }

        // ---------------------------------------------------------------------
        // RULE 4: EXPLAINABLE CROSS-ENTITY MATCHING (NAME, DOB, ID)
        // ---------------------------------------------------------------------
        String formFullName = formData.get("fullName") != null ? formData.get("fullName").toString() : null;
        String formDob = formData.get("dateOfBirth") != null ? formData.get("dateOfBirth").toString() : null;
        String formId = formData.get("aadhaarNumber") != null ? formData.get("aadhaarNumber").toString() : null;

        for (ApplicationDocument doc : uploadedDocs) {
            Map<String, String> ocrFields = documentExtractedFieldsMap.get(doc.getId());
            if (ocrFields == null || ocrFields.isEmpty()) continue;

            // 4a. Name Match
            if (formFullName != null && ocrFields.containsKey("fullName")) {
                String docName = ocrFields.get("fullName");
                double similarity = calculateSimilarity(formFullName, docName);

                if (similarity >= 0.99) {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_NAME", "fullName",
                            FindingOutcome.PASS, formFullName, docName,
                            "Applicant name in form perfectly matches name on document '" + doc.getFileName() + "'.",
                            "No action needed.",
                            BigDecimal.valueOf(similarity).setScale(4, RoundingMode.HALF_UP)
                    ));
                } else if (similarity >= 0.60) {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_NAME", "fullName",
                            FindingOutcome.WARNING, formFullName, docName,
                            String.format("Applicant name has minor typographical variation: Form has '%s' while document '%s' has '%s' (similarity: %d%%).",
                                    formFullName, doc.getFileName(), docName, (int) (similarity * 100)),
                            "Verify that the name spelling variation is an acceptable alias or abbreviation.",
                            BigDecimal.valueOf(similarity).setScale(4, RoundingMode.HALF_UP)
                    ));
                } else {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_NAME", "fullName",
                            FindingOutcome.FAIL, formFullName, docName,
                            String.format("Applicant name mismatch: Form specifies '%s' but document '%s' specifies '%s' (similarity: %d%%).",
                                    formFullName, doc.getFileName(), docName, (int) (similarity * 100)),
                            "Please ensure your application name matches the legal name printed on your government identity document.",
                            BigDecimal.valueOf(similarity).setScale(4, RoundingMode.HALF_UP)
                    ));
                }
            }

            // 4b. DOB Match
            if (formDob != null && ocrFields.containsKey("dateOfBirth")) {
                String docDob = ocrFields.get("dateOfBirth");
                boolean dobMatch = normalizeDate(formDob).equals(normalizeDate(docDob));

                if (dobMatch) {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_DOB", "dateOfBirth",
                            FindingOutcome.PASS, formDob, docDob,
                            "Date of birth matches between form and document '" + doc.getFileName() + "'.",
                            "No action needed.",
                            BigDecimal.valueOf(1.0000)
                    ));
                } else {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_DOB", "dateOfBirth",
                            FindingOutcome.FAIL, formDob, docDob,
                            String.format("Date of Birth discrepancy: Form states '%s' but document '%s' states '%s'.",
                                    formDob, doc.getFileName(), docDob),
                            "Check and align the date of birth in your application with your official certificate.",
                            BigDecimal.valueOf(1.0000)
                    ));
                }
            }

            // 4c. ID Match
            if (formId != null && ocrFields.containsKey("aadhaarNumber")) {
                String docId = ocrFields.get("aadhaarNumber").replaceAll("\\s+", "");
                String normFormId = formId.replaceAll("\\s+", "");

                if (normFormId.equals(docId)) {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_ID", "aadhaarNumber",
                            FindingOutcome.PASS, normFormId, docId,
                            "Identity proof document number matches form entry.",
                            "No action needed.",
                            BigDecimal.valueOf(1.0000)
                    ));
                } else {
                    findings.add(new PrescreeningFinding(
                            application, doc, "RULE_MATCH_ID", "aadhaarNumber",
                            FindingOutcome.FAIL, normFormId, docId,
                            String.format("Identity number discrepancy: Form has '%s' but document '%s' shows '%s'.",
                                    normFormId, doc.getFileName(), docId),
                            "Verify that you entered the correct identity card number.",
                            BigDecimal.valueOf(1.0000)
                    ));
                }
            }
        }

        // ---------------------------------------------------------------------
        // RULE 5: OCR QUALITY & CONFIDENCE UNCERTAINTY (RULE_UNCERTAINTY_QUALITY)
        // ---------------------------------------------------------------------
        for (OcrExtraction extraction : extractions) {
            BigDecimal conf = extraction.getConfidenceScore() != null ? extraction.getConfidenceScore() : BigDecimal.valueOf(0.80);
            if (conf.compareTo(BigDecimal.valueOf(0.70)) < 0) {
                findings.add(new PrescreeningFinding(
                        application, extraction.getDocument(), "RULE_UNCERTAINTY_QUALITY", "ocrQuality",
                        FindingOutcome.NEEDS_MANUAL_REVIEW, "Confidence >= 70%",
                        String.format("Score: %d%%", conf.multiply(BigDecimal.valueOf(100)).intValue()),
                        String.format("Document scan quality for '%s' is degraded or faint (confidence: %d%%). Flagged for human officer manual inspection without citizen penalty.",
                                extraction.getDocument().getFileName(), conf.multiply(BigDecimal.valueOf(100)).intValue()),
                        "No corrective action required from applicant; adjudicating officer will perform visual inspection.",
                        conf
                ));
            } else {
                findings.add(new PrescreeningFinding(
                        application, extraction.getDocument(), "RULE_UNCERTAINTY_QUALITY", "ocrQuality",
                        FindingOutcome.PASS, "Confidence >= 70%",
                        String.format("Score: %d%%", conf.multiply(BigDecimal.valueOf(100)).intValue()),
                        String.format("Document scan clarity and OCR confidence for '%s' are within automated thresholds.",
                                extraction.getDocument().getFileName()),
                        "No action needed.",
                        conf
                ));
            }
        }

        // 4. Save findings to repository
        List<PrescreeningFinding> savedFindings = findingRepository.saveAll(findings);
        log.info("Completed pre-screening: saved {} findings for application ID {}", savedFindings.size(), applicationId);

        return buildSummaryResponse(application, savedFindings, extractions);
    }

    /**
     * Retrieve all pre-screening findings for an application.
     */
    @Transactional(readOnly = true)
    public List<PrescreeningFindingResponse> getFindings(Long applicationId, Long userId, Role role) {
        Application application = getApplicationOrThrow(applicationId);
        checkAccess(application, userId, role);

        return findingRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId).stream()
                .map(this::mapToFindingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve pre-screening summary with findings and extractions.
     */
    @Transactional(readOnly = true)
    public PrescreeningSummaryResponse getSummary(Long applicationId, Long userId, Role role) {
        Application application = getApplicationOrThrow(applicationId);
        checkAccess(application, userId, role);

        List<PrescreeningFinding> findings = findingRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId);
        List<OcrExtraction> extractions = ocrExtractionRepository.findByDocumentApplicationId(applicationId);

        return buildSummaryResponse(application, findings, extractions);
    }

    // =========================================================================
    // HELPER & UTILITY METHODS
    // =========================================================================

    public static int calculateLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[s1.length()][s2.length()];
    }

    public static double calculateSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        String norm1 = normalizeString(s1);
        String norm2 = normalizeString(s2);
        if (norm1.equals(norm2)) return 1.0;
        int maxLen = Math.max(norm1.length(), norm2.length());
        if (maxLen == 0) return 1.0;
        int dist = calculateLevenshteinDistance(norm1, norm2);
        return 1.0 - ((double) dist / (double) maxLen);
    }

    public static String normalizeString(String s) {
        if (s == null) return "";
        return s.toLowerCase()
                .replaceAll("\\b(mr|mrs|ms|shri|smt|sri|dr)\\b[.]?", "")
                .replaceAll("[^a-z0-9]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public static String normalizeDate(String d) {
        if (d == null) return "";
        String clean = d.trim().replaceAll("[/.]", "-");
        // if DD-MM-YYYY, convert to YYYY-MM-DD
        if (clean.matches("^[0-9]{2}-[0-9]{2}-[0-9]{4}$")) {
            String[] parts = clean.split("-");
            return parts[2] + "-" + parts[1] + "-" + parts[0];
        }
        return clean;
    }

    private Application getApplicationOrThrow(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
    }

    private void checkAccess(Application application, Long userId, Role role) {
        if (role == Role.ADMIN) return;
        if (role == Role.CITIZEN) {
            if (!application.getCitizen().getId().equals(userId)) {
                throw new AccessDeniedException("Access denied: You do not own this application");
            }
            return;
        }
        if (role == Role.OFFICER) {
            User officer = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + userId));
            Long departmentId = application.getService().getDepartment().getId();
            boolean isAssigned = assignmentRepository.existsByUserIdAndDepartmentId(officer.getId(), departmentId);
            if (!isAssigned) {
                throw new AccessDeniedException("Access denied: You are not assigned to the department for this application");
            }
        }
    }

    private Map<String, Object> deserializeFormData(String json) {
        if (json == null || json.trim().isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private Map<String, String> parseExtractedFields(String json) {
        if (json == null || json.trim().isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private PrescreeningSummaryResponse buildSummaryResponse(Application app,
                                                             List<PrescreeningFinding> findings,
                                                             List<OcrExtraction> extractions) {
        int passCount = 0;
        int failCount = 0;
        int warningCount = 0;
        int reviewCount = 0;

        BigDecimal totalConf = BigDecimal.ZERO;
        int confCount = 0;

        for (PrescreeningFinding f : findings) {
            if (f.getOutcome() == FindingOutcome.PASS) passCount++;
            else if (f.getOutcome() == FindingOutcome.FAIL) failCount++;
            else if (f.getOutcome() == FindingOutcome.WARNING) warningCount++;
            else if (f.getOutcome() == FindingOutcome.NEEDS_MANUAL_REVIEW) reviewCount++;

            if (f.getConfidence() != null) {
                totalConf = totalConf.add(f.getConfidence());
                confCount++;
            }
        }

        String overallStatus = "PASSED";
        if (failCount > 0) {
            overallStatus = "HAS_FAILS";
        } else if (reviewCount > 0) {
            overallStatus = "NEEDS_MANUAL_REVIEW";
        } else if (warningCount > 0) {
            overallStatus = "HAS_WARNINGS";
        }

        BigDecimal avgConfidence = confCount > 0
                ? totalConf.divide(BigDecimal.valueOf(confCount), 4, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(1.0000);

        List<PrescreeningFindingResponse> findingDTOs = findings.stream()
                .map(this::mapToFindingResponse)
                .collect(Collectors.toList());

        List<OcrExtractionResponse> extractionDTOs = extractions.stream()
                .map(this::mapToExtractionResponse)
                .collect(Collectors.toList());

        return new PrescreeningSummaryResponse(
                app.getId(),
                app.getReferenceNumber(),
                overallStatus,
                findings.size(),
                passCount,
                failCount,
                warningCount,
                reviewCount,
                avgConfidence,
                findingDTOs,
                extractionDTOs
        );
    }

    private PrescreeningFindingResponse mapToFindingResponse(PrescreeningFinding f) {
        return new PrescreeningFindingResponse(
                f.getId(),
                f.getApplication().getId(),
                f.getDocument() != null ? f.getDocument().getId() : null,
                f.getDocument() != null ? f.getDocument().getFileName() : null,
                f.getRuleCode(),
                f.getFieldKey(),
                f.getOutcome(),
                f.getExpectedValue(),
                f.getExtractedValue(),
                f.getExplanation(),
                f.getSuggestedAction(),
                f.getConfidence(),
                f.getCreatedAt()
        );
    }

    private OcrExtractionResponse mapToExtractionResponse(OcrExtraction e) {
        Map<String, Object> fieldsMap = new HashMap<>();
        if (e.getExtractedFields() != null) {
            try {
                fieldsMap = objectMapper.readValue(e.getExtractedFields(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception ignored) {
            }
        }

        return new OcrExtractionResponse(
                e.getId(),
                e.getDocument().getId(),
                e.getDocument().getFileName(),
                e.getEngineName(),
                e.getEngineVersion(),
                e.getRawText(),
                fieldsMap,
                e.getConfidenceScore(),
                e.getProcessingStatus(),
                e.getCreatedAt()
        );
    }
}
