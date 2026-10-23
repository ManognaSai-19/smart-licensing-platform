package com.licensing.platform.controller;

import com.licensing.platform.dto.PrescreeningFindingResponse;
import com.licensing.platform.dto.PrescreeningSummaryResponse;
import com.licensing.platform.security.UserPrincipal;
import com.licensing.platform.service.PrescreeningEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/prescreening")
public class PrescreeningController {

    private final PrescreeningEngineService prescreeningEngineService;

    public PrescreeningController(PrescreeningEngineService prescreeningEngineService) {
        this.prescreeningEngineService = prescreeningEngineService;
    }

    /**
     * Trigger OCR extraction and explainable pre-screening rules on the application.
     */
    @PostMapping("/run")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescreeningSummaryResponse> runPrescreening(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        PrescreeningSummaryResponse summary = prescreeningEngineService.runPrescreening(
                applicationId, principal.getId(), principal.getRole()
        );
        return ResponseEntity.ok(summary);
    }

    /**
     * Get the latest pre-screening summary and overall confidence metrics.
     */
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescreeningSummaryResponse> getSummary(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        PrescreeningSummaryResponse summary = prescreeningEngineService.getSummary(
                applicationId, principal.getId(), principal.getRole()
        );
        return ResponseEntity.ok(summary);
    }

    /**
     * Get all detailed explainable pre-screening findings.
     */
    @GetMapping("/findings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PrescreeningFindingResponse>> getFindings(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PrescreeningFindingResponse> findings = prescreeningEngineService.getFindings(
                applicationId, principal.getId(), principal.getRole()
        );
        return ResponseEntity.ok(findings);
    }
}
