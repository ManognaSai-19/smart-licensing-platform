package com.licensing.platform.service;

import com.licensing.platform.dto.DocumentChecklistStatusResponse;
import com.licensing.platform.dto.DocumentUploadResponse;
import com.licensing.platform.exception.InvalidStateTransitionException;
import com.licensing.platform.exception.ResourceNotFoundException;
import com.licensing.platform.exception.ValidationException;
import com.licensing.platform.model.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final ApplicationRepository applicationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final RequiredDocumentTypeRepository requiredDocumentTypeRepository;
    private final UserRepository userRepository;
    private final OfficerDepartmentAssignmentRepository assignmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final DocumentStorageService documentStorageService;

    public DocumentService(ApplicationRepository applicationRepository,
                           ApplicationDocumentRepository documentRepository,
                           RequiredDocumentTypeRepository requiredDocumentTypeRepository,
                           UserRepository userRepository,
                           OfficerDepartmentAssignmentRepository assignmentRepository,
                           AuditLogRepository auditLogRepository,
                           DocumentStorageService documentStorageService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.requiredDocumentTypeRepository = requiredDocumentTypeRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.documentStorageService = documentStorageService;
    }

    /**
     * Upload a document for an application. If a document for this document type
     * already exists on the draft application, the previous file is replaced.
     */
    public DocumentUploadResponse uploadDocument(Long applicationId, Long documentTypeId, MultipartFile file, Long userId) {
        Application application = getApplicationOrThrow(applicationId);

        // 1. Authorization: Only application owner can upload
        if (!application.getCitizen().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to upload documents for this application");
        }

        // 2. Lifecycle check: Only allowed in DRAFT or REJECTED state
        if (application.getStatus() != ApplicationStatus.DRAFT && application.getStatus() != ApplicationStatus.REJECTED) {
            throw new InvalidStateTransitionException(
                    "Cannot upload documents for application in status: " + application.getStatus() +
                            ". Documents can only be uploaded when application is DRAFT or REJECTED."
            );
        }

        // 3. Document type check: Ensure document type belongs to this application's service
        RequiredDocumentType docType = requiredDocumentTypeRepository.findById(documentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Required document type not found with id: " + documentTypeId));

        if (!docType.getService().getId().equals(application.getService().getId())) {
            throw new ValidationException("Document type does not belong to the service associated with this application",
                    Map.of("documentTypeId", "Invalid document type for service " + application.getService().getCode()));
        }

        // 4. File validation (Format, magic bytes, size, path safety)
        documentStorageService.validateFile(file, docType);

        // 5. SHA-256 Checksum & true MIME type
        String checksum = documentStorageService.calculateChecksum(file);
        String detectedMime = documentStorageService.detectMimeFromMagicBytes(readHeader(file));
        if (detectedMime == null) {
            detectedMime = file.getContentType();
        }

        // 6. Check for existing document of same type on this application (Replacement)
        Optional<ApplicationDocument> existingDocOpt = documentRepository.findByApplicationIdAndDocumentTypeId(applicationId, documentTypeId);

        ApplicationDocument savedDoc;
        if (existingDocOpt.isPresent()) {
            ApplicationDocument existing = existingDocOpt.get();
            // Delete old physical file
            documentStorageService.deleteFile(existing.getStorageKey());

            // Store new file
            String newStorageKey = documentStorageService.storeFile(file, "app_" + applicationId);

            // Update existing entity
            existing.setFileName(file.getOriginalFilename());
            existing.setStorageKey(newStorageKey);
            existing.setContentType(detectedMime);
            existing.setFileSizeBytes(file.getSize());
            existing.setFileChecksum(checksum);
            savedDoc = documentRepository.save(existing);
            log.info("Replaced existing document ID {} for application ID {}", existing.getId(), applicationId);
        } else {
            // Store new file
            String newStorageKey = documentStorageService.storeFile(file, "app_" + applicationId);
            ApplicationDocument newDoc = new ApplicationDocument(
                    application,
                    docType,
                    file.getOriginalFilename(),
                    newStorageKey,
                    detectedMime,
                    file.getSize(),
                    checksum
            );
            savedDoc = documentRepository.save(newDoc);
            log.info("Created new document ID {} for application ID {}", savedDoc.getId(), applicationId);
        }

        // 7. Record Audit Log
        recordAuditLog(application.getCitizen(), "UPLOAD_DOCUMENT", "APPLICATION_DOCUMENT", savedDoc.getId().toString(),
                String.format("{\"applicationId\":%d,\"docType\":\"%s\",\"fileName\":\"%s\"}",
                        applicationId, docType.getDocumentCode(), file.getOriginalFilename()));

        return mapToUploadResponse(savedDoc);
    }

    /**
     * Retrieve all uploaded documents for an application with access control.
     */
    @Transactional(readOnly = true)
    public List<DocumentUploadResponse> getApplicationDocuments(Long applicationId, Long userId, Role role) {
        Application application = getApplicationOrThrow(applicationId);
        checkDocumentAccess(application, userId, role);

        return documentRepository.findByApplicationId(applicationId).stream()
                .map(this::mapToUploadResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve checklist status for all required document types for the service.
     */
    @Transactional(readOnly = true)
    public List<DocumentChecklistStatusResponse> getDocumentChecklistStatus(Long applicationId, Long userId, Role role) {
        Application application = getApplicationOrThrow(applicationId);
        checkDocumentAccess(application, userId, role);

        List<RequiredDocumentType> requiredTypes = requiredDocumentTypeRepository.findByServiceId(application.getService().getId());
        List<ApplicationDocument> uploadedDocs = documentRepository.findByApplicationId(applicationId);
        Map<Long, ApplicationDocument> uploadedByTypeId = uploadedDocs.stream()
                .collect(Collectors.toMap(d -> d.getDocumentType().getId(), d -> d, (d1, d2) -> d1));

        return requiredTypes.stream().map(type -> {
            ApplicationDocument uploaded = uploadedByTypeId.get(type.getId());
            boolean isUploaded = uploaded != null;
            Long docId = isUploaded ? uploaded.getId() : null;
            String fileName = isUploaded ? uploaded.getFileName() : null;
            String contentType = isUploaded ? uploaded.getContentType() : null;
            Long fileSizeBytes = isUploaded ? uploaded.getFileSizeBytes() : null;
            Instant uploadedAt = isUploaded ? uploaded.getUploadedAt() : null;
            String previewUrl = isUploaded ? "/api/applications/" + applicationId + "/documents/" + docId + "/preview" : null;
            String downloadUrl = isUploaded ? "/api/applications/" + applicationId + "/documents/" + docId + "/download" : null;

            return new DocumentChecklistStatusResponse(
                    type.getId(),
                    type.getDocumentCode(),
                    type.getNameEn(),
                    type.getNameTe(),
                    type.isRequired(),
                    type.getAcceptedMimeTypes(),
                    type.getMaxSizeBytes(),
                    isUploaded,
                    docId,
                    fileName,
                    contentType,
                    fileSizeBytes,
                    uploadedAt,
                    previewUrl,
                    downloadUrl
            );
        }).collect(Collectors.toList());
    }

    /**
     * Retrieve single document entity and resource for preview or download.
     */
    @Transactional(readOnly = true)
    public ApplicationDocument getDocumentEntity(Long applicationId, Long documentId, Long userId, Role role) {
        Application application = getApplicationOrThrow(applicationId);
        checkDocumentAccess(application, userId, role);

        ApplicationDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (!document.getApplication().getId().equals(applicationId)) {
            throw new ResourceNotFoundException("Document does not belong to application id: " + applicationId);
        }

        return document;
    }

    /**
     * Loads the document file as a Spring Resource.
     */
    @Transactional(readOnly = true)
    public Resource getDocumentResource(ApplicationDocument document) {
        return documentStorageService.loadFileAsResource(document.getStorageKey());
    }

    /**
     * Delete a document from an application while in DRAFT or REJECTED status.
     */
    public void deleteDocument(Long applicationId, Long documentId, Long userId) {
        Application application = getApplicationOrThrow(applicationId);

        // 1. Ownership check: Only application owner can delete
        if (!application.getCitizen().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete documents from this application");
        }

        // 2. Lifecycle check: Only allowed in DRAFT or REJECTED state
        if (application.getStatus() != ApplicationStatus.DRAFT && application.getStatus() != ApplicationStatus.REJECTED) {
            throw new InvalidStateTransitionException(
                    "Cannot delete documents when application is in status: " + application.getStatus() +
                            ". Documents can only be modified in DRAFT or REJECTED states."
            );
        }

        ApplicationDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (!document.getApplication().getId().equals(applicationId)) {
            throw new ResourceNotFoundException("Document does not belong to application id: " + applicationId);
        }

        // 3. Delete physical file
        documentStorageService.deleteFile(document.getStorageKey());

        // 4. Delete DB record
        documentRepository.delete(document);

        // 5. Audit log
        recordAuditLog(application.getCitizen(), "DELETE_DOCUMENT", "APPLICATION_DOCUMENT", documentId.toString(),
                String.format("{\"applicationId\":%d,\"fileName\":\"%s\"}", applicationId, document.getFileName()));

        log.info("Deleted document ID {} from application ID {}", documentId, applicationId);
    }

    /**
     * Validates that all mandatory documents for the service have been uploaded.
     */
    @Transactional(readOnly = true)
    public void validateMandatoryDocuments(Long applicationId) {
        Application application = getApplicationOrThrow(applicationId);
        List<RequiredDocumentType> requiredTypes = requiredDocumentTypeRepository.findByServiceId(application.getService().getId())
                .stream()
                .filter(RequiredDocumentType::isRequired)
                .toList();

        List<ApplicationDocument> uploadedDocs = documentRepository.findByApplicationId(applicationId);
        Set<Long> uploadedTypeIds = uploadedDocs.stream()
                .map(d -> d.getDocumentType().getId())
                .collect(Collectors.toSet());

        Map<String, String> missingDocs = new HashMap<>();
        for (RequiredDocumentType type : requiredTypes) {
            if (!uploadedTypeIds.contains(type.getId())) {
                missingDocs.put(type.getDocumentCode(), "Mandatory document missing: " + type.getNameEn());
            }
        }

        if (!missingDocs.isEmpty()) {
            throw new ValidationException("Mandatory documents are missing for this application", missingDocs);
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private Application getApplicationOrThrow(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
    }

    private void checkDocumentAccess(Application application, Long userId, Role role) {
        if (role == Role.ADMIN) {
            return; // Admins have global access
        }

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

    private byte[] readHeader(MultipartFile file) {
        byte[] header = new byte[8];
        try (var in = file.getInputStream()) {
            in.read(header);
        } catch (Exception ignored) {
        }
        return header;
    }

    private void recordAuditLog(User actor, String action, String resourceType, String resourceId, String details) {
        AuditLog logEntry = new AuditLog(actor, action, resourceType, resourceId, "127.0.0.1", details);
        auditLogRepository.save(logEntry);
    }

    private DocumentUploadResponse mapToUploadResponse(ApplicationDocument doc) {
        return new DocumentUploadResponse(
                doc.getId(),
                doc.getApplication().getId(),
                doc.getDocumentType().getId(),
                doc.getDocumentType().getDocumentCode(),
                doc.getDocumentType().getNameEn(),
                doc.getDocumentType().getNameTe(),
                doc.getFileName(),
                doc.getStorageKey(),
                doc.getContentType(),
                doc.getFileSizeBytes(),
                doc.getFileChecksum(),
                doc.getUploadedAt(),
                "/api/applications/" + doc.getApplication().getId() + "/documents/" + doc.getId() + "/preview",
                "/api/applications/" + doc.getApplication().getId() + "/documents/" + doc.getId() + "/download"
        );
    }
}
