package com.licensing.platform.controller;

import com.licensing.platform.dto.*;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.security.UserPrincipal;
import com.licensing.platform.service.ApplicationWorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationWorkflowService workflowService;

    public ApplicationController(ApplicationWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    // =========================================================================
    // 1. CITIZEN ENDPOINTS
    // =========================================================================

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApplicationDetailResponse> createDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateApplicationRequest request) {
        ApplicationDetailResponse created = workflowService.createDraft(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<ApplicationSummaryResponse>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ApplicationSummaryResponse> list = workflowService.getCitizenApplications(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/draft")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApplicationDetailResponse> updateDraft(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateDraftRequest request) {
        ApplicationDetailResponse updated = workflowService.updateDraft(id, principal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApplicationDetailResponse> submitApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) SubmitApplicationRequest request) {
        ApplicationDetailResponse submitted = workflowService.submitApplication(id, principal.getId(), request);
        return ResponseEntity.ok(submitted);
    }

    @PostMapping("/{id}/resubmit")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApplicationDetailResponse> resubmitApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) SubmitApplicationRequest request) {
        ApplicationDetailResponse resubmitted = workflowService.resubmitApplication(id, principal.getId(), request);
        return ResponseEntity.ok(resubmitted);
    }

    // =========================================================================
    // 2. SHARED DETAILS ENDPOINT (CITIZEN OWNERSHIP / OFFICER DEPT / ADMIN)
    // =========================================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDetailResponse> getApplicationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ApplicationDetailResponse details = workflowService.getApplicationById(id, principal);
        return ResponseEntity.ok(details);
    }

    // =========================================================================
    // 3. OFFICER ENDPOINTS
    // =========================================================================

    @GetMapping("/officer/queue")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<List<ApplicationSummaryResponse>> getOfficerQueue(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ApplicationSummaryResponse> queue = workflowService.getOfficerQueue(principal.getId());
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/{id}/start-review")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<ApplicationDetailResponse> startReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ApplicationDetailResponse response = workflowService.startReview(id, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<ApplicationDetailResponse> submitDecision(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReviewDecisionRequest request) {
        ApplicationDetailResponse response = workflowService.submitDecision(id, principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // 4. ADMIN OVERSIGHT
    // =========================================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationSummaryResponse>> getAdminApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String query) {
        List<ApplicationSummaryResponse> list = workflowService.getAdminApplications(status, departmentId, query);
        return ResponseEntity.ok(list);
    }
}
