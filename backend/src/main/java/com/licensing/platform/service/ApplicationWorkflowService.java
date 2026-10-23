package com.licensing.platform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.dto.*;
import com.licensing.platform.exception.InvalidStateTransitionException;
import com.licensing.platform.exception.ResourceNotFoundException;
import com.licensing.platform.exception.ValidationException;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.DecisionType;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import com.licensing.platform.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationWorkflowService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final ReviewDecisionRepository reviewDecisionRepository;
    private final ServiceDefinitionRepository serviceRepository;
    private final ServiceFieldRepository serviceFieldRepository;
    private final RequiredDocumentTypeRepository documentTypeRepository;
    private final UserRepository userRepository;
    private final OfficerDepartmentAssignmentRepository assignmentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final FormDataValidationService formDataValidationService;
    private final ObjectMapper objectMapper;

    public ApplicationWorkflowService(ApplicationRepository applicationRepository,
                                      ApplicationStatusHistoryRepository statusHistoryRepository,
                                      ReviewDecisionRepository reviewDecisionRepository,
                                      ServiceDefinitionRepository serviceRepository,
                                      ServiceFieldRepository serviceFieldRepository,
                                      RequiredDocumentTypeRepository documentTypeRepository,
                                      UserRepository userRepository,
                                      OfficerDepartmentAssignmentRepository assignmentRepository,
                                      NotificationRepository notificationRepository,
                                      AuditLogRepository auditLogRepository,
                                      FormDataValidationService formDataValidationService,
                                      ObjectMapper objectMapper) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.reviewDecisionRepository = reviewDecisionRepository;
        this.serviceRepository = serviceRepository;
        this.serviceFieldRepository = serviceFieldRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.formDataValidationService = formDataValidationService;
        this.objectMapper = objectMapper;
    }

    // =========================================================================
    // 1. CITIZEN APPLICATION WORKFLOW
    // =========================================================================

    public ApplicationDetailResponse createDraft(Long citizenId, CreateApplicationRequest request) {
        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + citizenId));

        ServiceDefinition service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        if (!service.isActive()) {
            throw new InvalidStateTransitionException("Cannot apply for inactive service: " + service.getName());
        }

        String referenceNumber = generateUniqueReferenceNumber();
        String jsonFormData = serializeFormData(request.getInitialFormData());

        Application application = new Application(
                referenceNumber,
                citizen,
                service,
                jsonFormData,
                request.getLanguagePreference()
        );

        Application saved = applicationRepository.save(application);

        // Record initial status history
        recordStatusHistory(saved, null, ApplicationStatus.DRAFT.name(), citizen, "Application draft created");

        // Record audit log
        recordAuditLog(citizen, "CREATE_DRAFT", "APPLICATION", saved.getId().toString(),
                "{\"referenceNumber\":\"" + referenceNumber + "\",\"serviceCode\":\"" + service.getCode() + "\"}");

        log.info("Created draft application '{}' (ID: {}) for citizen ID: {}", referenceNumber, saved.getId(), citizenId);
        return mapToDetailResponse(saved);
    }

    public ApplicationDetailResponse updateDraft(Long applicationId, Long citizenId, UpdateDraftRequest request) {
        Application app = getApplicationEntity(applicationId);

        if (!app.getCitizen().getId().equals(citizenId)) {
            throw new AccessDeniedException("You do not own this application");
        }

        if (app.getStatus() != ApplicationStatus.DRAFT && app.getStatus() != ApplicationStatus.REJECTED) {
            throw new InvalidStateTransitionException("Cannot modify application in status: " + app.getStatus() + ". Only DRAFT or REJECTED applications can be modified.");
        }

        if (request.getFormData() != null) {
            app.setFormData(serializeFormData(request.getFormData()));
        }
        if (request.getLanguagePreference() != null) {
            app.setLanguagePreference(request.getLanguagePreference());
        }

        Application updated = applicationRepository.save(app);
        log.info("Updated draft data for application '{}' (ID: {})", app.getReferenceNumber(), app.getId());
        return mapToDetailResponse(updated);
    }

    public ApplicationDetailResponse submitApplication(Long applicationId, Long citizenId, SubmitApplicationRequest request) {
        Application app = getApplicationEntity(applicationId);

        if (!app.getCitizen().getId().equals(citizenId)) {
            throw new AccessDeniedException("You do not own this application");
        }

        if (app.getStatus() != ApplicationStatus.DRAFT) {
            throw new InvalidStateTransitionException("Cannot submit application in status: " + app.getStatus() + ". Application must be in DRAFT state.");
        }

        // Update form data if provided in request
        if (request != null && request.getFormData() != null) {
            app.setFormData(serializeFormData(request.getFormData()));
        }

        // Validate form data against service field specifications
        Map<String, Object> dataMap = deserializeFormData(app.getFormData());
        List<ServiceField> fields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(app.getService().getId());
        formDataValidationService.validateFormData(dataMap, fields);

        // State transition: DRAFT -> SUBMITTED
        ApplicationStatus previousStatus = app.getStatus();
        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setSubmittedAt(Instant.now());

        Application saved = applicationRepository.save(app);

        // Record status history & notifications
        recordStatusHistory(saved, previousStatus.name(), ApplicationStatus.SUBMITTED.name(), app.getCitizen(),
                "Application formally submitted for departmental verification");

        sendNotification(app.getCitizen(), saved,
                "Application Submitted (" + app.getReferenceNumber() + ")",
                "Your application for " + app.getService().getName() + " has been successfully submitted and routed for verification.");

        recordAuditLog(app.getCitizen(), "SUBMIT_APPLICATION", "APPLICATION", saved.getId().toString(),
                "{\"referenceNumber\":\"" + app.getReferenceNumber() + "\"}");

        log.info("Application '{}' (ID: {}) transitioned from {} to {}", saved.getReferenceNumber(), saved.getId(), previousStatus, saved.getStatus());
        return mapToDetailResponse(saved);
    }

    public ApplicationDetailResponse resubmitApplication(Long applicationId, Long citizenId, SubmitApplicationRequest request) {
        Application app = getApplicationEntity(applicationId);

        if (!app.getCitizen().getId().equals(citizenId)) {
            throw new AccessDeniedException("You do not own this application");
        }

        if (app.getStatus() != ApplicationStatus.REJECTED) {
            throw new InvalidStateTransitionException("Cannot resubmit application in status: " + app.getStatus() + ". Only REJECTED applications can be resubmitted.");
        }

        // Update form data if provided
        if (request != null && request.getFormData() != null) {
            app.setFormData(serializeFormData(request.getFormData()));
        }

        // Validate corrected form data
        Map<String, Object> dataMap = deserializeFormData(app.getFormData());
        List<ServiceField> fields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(app.getService().getId());
        formDataValidationService.validateFormData(dataMap, fields);

        // State transition: REJECTED -> RESUBMITTED
        ApplicationStatus previousStatus = app.getStatus();
        app.setStatus(ApplicationStatus.RESUBMITTED);

        Application saved = applicationRepository.save(app);

        recordStatusHistory(saved, previousStatus.name(), ApplicationStatus.RESUBMITTED.name(), app.getCitizen(),
                "Application revised and resubmitted by citizen for re-verification");

        sendNotification(app.getCitizen(), saved,
                "Application Resubmitted (" + app.getReferenceNumber() + ")",
                "Your revised application for " + app.getService().getName() + " has been resubmitted for departmental review.");

        recordAuditLog(app.getCitizen(), "RESUBMIT_APPLICATION", "APPLICATION", saved.getId().toString(),
                "{\"referenceNumber\":\"" + app.getReferenceNumber() + "\"}");

        log.info("Application '{}' (ID: {}) resubmitted from {} to {}", saved.getReferenceNumber(), saved.getId(), previousStatus, saved.getStatus());
        return mapToDetailResponse(saved);
    }

    // =========================================================================
    // 2. OFFICER WORKFLOW & DECISION ENGINE
    // =========================================================================

    public ApplicationDetailResponse startReview(Long applicationId, Long officerId) {
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        Application app = getApplicationEntity(applicationId);
        verifyOfficerDepartmentAccess(officer, app.getService().getDepartment().getId());

        if (app.getStatus() == ApplicationStatus.UNDER_VERIFICATION) {
            return mapToDetailResponse(app);
        }

        if (app.getStatus() != ApplicationStatus.SUBMITTED && app.getStatus() != ApplicationStatus.RESUBMITTED) {
            throw new InvalidStateTransitionException("Cannot start review on application in status: " + app.getStatus() + ". Application must be SUBMITTED or RESUBMITTED.");
        }

        ApplicationStatus previousStatus = app.getStatus();
        app.setStatus(ApplicationStatus.UNDER_VERIFICATION);

        Application saved = applicationRepository.save(app);

        recordStatusHistory(saved, previousStatus.name(), ApplicationStatus.UNDER_VERIFICATION.name(), officer,
                "Verification commenced by officer: " + officer.getFullName());

        recordAuditLog(officer, "START_REVIEW", "APPLICATION", saved.getId().toString(),
                "{\"officer\":\"" + officer.getEmail() + "\"}");

        log.info("Officer '{}' started verification on application '{}' (ID: {})", officer.getEmail(), saved.getReferenceNumber(), saved.getId());
        return mapToDetailResponse(saved);
    }

    public ApplicationDetailResponse submitDecision(Long applicationId, Long officerId, ReviewDecisionRequest request) {
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        Application app = getApplicationEntity(applicationId);
        verifyOfficerDepartmentAccess(officer, app.getService().getDepartment().getId());

        if (app.getStatus() != ApplicationStatus.UNDER_VERIFICATION) {
            throw new InvalidStateTransitionException("Cannot record decision on application in status: " + app.getStatus() + ". Application must be UNDER_VERIFICATION.");
        }

        if (request.getDecision() == DecisionType.REJECTED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new ValidationException("Rejection reason is mandatory when rejecting an application",
                        Map.of("rejectionReason", "Mandatory explanation required for rejection"));
            }
        }

        // Record ReviewDecision entity
        ReviewDecision decision = new ReviewDecision(
                app,
                officer,
                request.getDecision(),
                request.getRejectionReason() != null ? request.getRejectionReason().trim() : null,
                request.getInternalNotes() != null ? request.getInternalNotes().trim() : null
        );
        reviewDecisionRepository.save(decision);

        // State transition: UNDER_VERIFICATION -> APPROVED / REJECTED
        ApplicationStatus previousStatus = app.getStatus();
        ApplicationStatus newStatus = request.getDecision() == DecisionType.APPROVED
                ? ApplicationStatus.APPROVED
                : ApplicationStatus.REJECTED;

        app.setStatus(newStatus);
        Application saved = applicationRepository.save(app);

        String note = request.getDecision() == DecisionType.APPROVED
                ? "Application approved by officer: " + officer.getFullName()
                : "Application rejected by officer: " + officer.getFullName() + ". Reason: " + request.getRejectionReason();

        recordStatusHistory(saved, previousStatus.name(), newStatus.name(), officer, note);

        if (newStatus == ApplicationStatus.APPROVED) {
            sendNotification(app.getCitizen(), saved,
                    "Application Approved! (" + app.getReferenceNumber() + ")",
                    "Congratulations! Your application for " + app.getService().getName() + " has been approved.");
        } else {
            sendNotification(app.getCitizen(), saved,
                    "Action Required: Application Needs Correction (" + app.getReferenceNumber() + ")",
                    "Your application for " + app.getService().getName() + " was reviewed and requires updates. Reason: " + request.getRejectionReason());
        }

        recordAuditLog(officer, "DECISION_" + newStatus.name(), "APPLICATION", saved.getId().toString(),
                "{\"decision\":\"" + newStatus.name() + "\",\"officer\":\"" + officer.getEmail() + "\"}");

        log.info("Application '{}' (ID: {}) decided by {}: {}", saved.getReferenceNumber(), saved.getId(), officer.getEmail(), newStatus);
        return mapToDetailResponse(saved);
    }

    // =========================================================================
    // 3. RETRIEVAL & QUEUES
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ApplicationSummaryResponse> getCitizenApplications(Long citizenId) {
        return applicationRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId).stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationSummaryResponse> getOfficerQueue(Long officerId) {
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (officer.getRole() == Role.ADMIN) {
            return applicationRepository.findByStatusOrderByCreatedAtDesc(ApplicationStatus.SUBMITTED).stream()
                    .map(this::mapToSummaryResponse)
                    .collect(Collectors.toList());
        }

        List<OfficerDepartmentAssignment> assignments = assignmentRepository.findByUserId(officerId);
        if (assignments.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> departmentIds = assignments.stream()
                .map(a -> a.getDepartment().getId())
                .collect(Collectors.toList());

        List<ApplicationStatus> queueStatuses = List.of(
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.UNDER_VERIFICATION,
                ApplicationStatus.RESUBMITTED
        );

        return applicationRepository.findByServiceDepartmentIdInAndStatusInOrderByCreatedAtDesc(departmentIds, queueStatuses).stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationSummaryResponse> getAdminApplications(ApplicationStatus status, Long departmentId, String query) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return applicationRepository.searchApplications(status, departmentId, cleanQuery).stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationById(Long applicationId, UserPrincipal principal) {
        Application app = getApplicationEntity(applicationId);

        // Security authorization check
        if (principal.getRole() == Role.CITIZEN) {
            if (!app.getCitizen().getId().equals(principal.getId())) {
                throw new AccessDeniedException("You do not have permission to view another citizen's application");
            }
        } else if (principal.getRole() == Role.OFFICER) {
            Long appDeptId = app.getService().getDepartment().getId();
            boolean isAssigned = assignmentRepository.existsByUserIdAndDepartmentId(principal.getId(), appDeptId);
            if (!isAssigned) {
                throw new AccessDeniedException("Officer is not assigned to the department handling this application");
            }
        }
        // ADMIN can view all

        return mapToDetailResponse(app);
    }

    // =========================================================================
    // 4. HELPER METHODS & MAPPERS
    // =========================================================================

    private Application getApplicationEntity(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
    }

    private void verifyOfficerDepartmentAccess(User officer, Long departmentId) {
        if (officer.getRole() == Role.ADMIN) {
            return;
        }
        boolean isAssigned = assignmentRepository.existsByUserIdAndDepartmentId(officer.getId(), departmentId);
        if (!isAssigned) {
            throw new AccessDeniedException("Officer is not authorized to act on applications for department ID: " + departmentId);
        }
    }

    private String generateUniqueReferenceNumber() {
        String datePrefix = "APP-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        String ref;
        do {
            StringBuilder sb = new StringBuilder(datePrefix);
            for (int i = 0; i < 5; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            ref = sb.toString();
        } while (applicationRepository.existsByReferenceNumber(ref));
        return ref;
    }

    private String serializeFormData(Map<String, Object> data) {
        if (data == null) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Failed to serialize form data: {}", e.getMessage());
            return "{}";
        }
    }

    private Map<String, Object> deserializeFormData(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize form data: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private void recordStatusHistory(Application app, String fromStatus, String toStatus, User user, String notes) {
        ApplicationStatusHistory history = new ApplicationStatusHistory(app, fromStatus, toStatus, user, notes);
        statusHistoryRepository.save(history);
    }

    private void sendNotification(User recipient, Application app, String title, String message) {
        Notification notification = new Notification(recipient, app, title, message);
        notificationRepository.save(notification);
    }

    private void recordAuditLog(User actor, String action, String resourceType, String resourceId, String details) {
        AuditLog logEntry = new AuditLog(actor, action, resourceType, resourceId, "127.0.0.1", details);
        auditLogRepository.save(logEntry);
    }

    private ApplicationSummaryResponse mapToSummaryResponse(Application a) {
        return new ApplicationSummaryResponse(
                a.getId(),
                a.getReferenceNumber(),
                a.getService().getId(),
                a.getService().getCode(),
                a.getService().getName(),
                a.getService().getDepartment().getId(),
                a.getService().getDepartment().getName(),
                a.getStatus(),
                a.getCitizen().getId(),
                a.getCitizen().getFullName(),
                a.getCitizen().getEmail(),
                a.getSubmittedAt(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    private ApplicationDetailResponse mapToDetailResponse(Application a) {
        List<ApplicationStatusHistoryResponse> historyResponses = statusHistoryRepository.findByApplicationIdOrderByCreatedAtAsc(a.getId()).stream()
                .map(h -> new ApplicationStatusHistoryResponse(
                        h.getId(),
                        h.getFromStatus(),
                        h.getToStatus(),
                        h.getChangedBy().getId(),
                        h.getChangedBy().getFullName(),
                        h.getNotes(),
                        h.getCreatedAt()
                ))
                .collect(Collectors.toList());

        List<ReviewDecisionResponse> decisionResponses = reviewDecisionRepository.findByApplicationIdOrderByDecidedAtDesc(a.getId()).stream()
                .map(d -> new ReviewDecisionResponse(
                        d.getId(),
                        d.getOfficer().getId(),
                        d.getOfficer().getFullName(),
                        d.getDecision(),
                        d.getRejectionReason(),
                        d.getInternalNotes(),
                        d.getDecidedAt()
                ))
                .collect(Collectors.toList());

        List<RequiredDocumentTypeResponse> requiredDocs = documentTypeRepository.findByServiceId(a.getService().getId()).stream()
                .map(d -> new RequiredDocumentTypeResponse(
                        d.getId(),
                        d.getDocumentCode(),
                        d.getNameEn(),
                        d.getNameTe(),
                        d.isRequired(),
                        d.getAcceptedMimeTypes(),
                        d.getMaxSizeBytes()
                ))
                .collect(Collectors.toList());

        return new ApplicationDetailResponse(
                a.getId(),
                a.getReferenceNumber(),
                a.getService().getId(),
                a.getService().getCode(),
                a.getService().getName(),
                a.getService().getDepartment().getId(),
                a.getService().getDepartment().getName(),
                a.getStatus(),
                a.getCitizen().getId(),
                a.getCitizen().getFullName(),
                a.getCitizen().getEmail(),
                a.getSubmittedAt(),
                a.getCreatedAt(),
                a.getUpdatedAt(),
                deserializeFormData(a.getFormData()),
                a.getLanguagePreference(),
                historyResponses,
                decisionResponses,
                requiredDocs,
                a.getDocuments() != null ? a.getDocuments().size() : 0,
                a.getFindings() != null ? a.getFindings().size() : 0
        );
    }
}
