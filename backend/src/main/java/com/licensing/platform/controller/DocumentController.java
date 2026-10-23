package com.licensing.platform.controller;

import com.licensing.platform.dto.DocumentChecklistStatusResponse;
import com.licensing.platform.dto.DocumentUploadResponse;
import com.licensing.platform.model.ApplicationDocument;
import com.licensing.platform.security.UserPrincipal;
import com.licensing.platform.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications/{applicationId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload or replace a supporting document for an application.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @PathVariable Long applicationId,
            @RequestParam("documentTypeId") Long documentTypeId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        DocumentUploadResponse response = documentService.uploadDocument(applicationId, documentTypeId, file, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * List all uploaded documents for an application.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentUploadResponse>> getDocuments(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<DocumentUploadResponse> documents = documentService.getApplicationDocuments(
                applicationId, principal.getId(), principal.getRole()
        );
        return ResponseEntity.ok(documents);
    }

    /**
     * Get dynamic checklist status (required vs uploaded) for all document types.
     */
    @GetMapping("/checklist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentChecklistStatusResponse>> getChecklist(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<DocumentChecklistStatusResponse> checklist = documentService.getDocumentChecklistStatus(
                applicationId, principal.getId(), principal.getRole()
        );
        return ResponseEntity.ok(checklist);
    }

    /**
     * Stream document inline for in-browser preview with ownership checks.
     */
    @GetMapping("/{documentId}/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> previewDocument(
            @PathVariable Long applicationId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ApplicationDocument doc = documentService.getDocumentEntity(
                applicationId, documentId, principal.getId(), principal.getRole()
        );
        Resource resource = documentService.getDocumentResource(doc);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(resource);
    }

    /**
     * Download document file with attachment disposition.
     */
    @GetMapping("/{documentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long applicationId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ApplicationDocument doc = documentService.getDocumentEntity(
                applicationId, documentId, principal.getId(), principal.getRole()
        );
        Resource resource = documentService.getDocumentResource(doc);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    /**
     * Delete an uploaded document while the application is in DRAFT or REJECTED status.
     */
    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long applicationId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        documentService.deleteDocument(applicationId, documentId, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    /**
     * Verify whether all mandatory documents for this application are present.
     */
    @PostMapping("/validate-checklist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> validateChecklist(
            @PathVariable Long applicationId) {
        documentService.validateMandatoryDocuments(applicationId);
        return ResponseEntity.ok(Map.of("status", "VALID", "message", "All mandatory documents have been uploaded"));
    }
}
