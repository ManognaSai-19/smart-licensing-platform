package com.licensing.platform.controller;

import com.licensing.platform.dto.*;
import com.licensing.platform.service.VoiceGuidanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceGuidanceService voiceGuidanceService;

    public VoiceController(VoiceGuidanceService voiceGuidanceService) {
        this.voiceGuidanceService = voiceGuidanceService;
    }

    /**
     * Get multilingual voice guidance prompts for a given service.
     */
    @GetMapping("/prompts/{serviceCode}")
    public ResponseEntity<VoiceServiceGuidanceResponse> getPrompts(
            @PathVariable String serviceCode,
            @RequestParam(required = false, defaultValue = "en") String lang) {
        VoiceServiceGuidanceResponse response = voiceGuidanceService.getGuidanceForService(serviceCode, lang);
        return ResponseEntity.ok(response);
    }

    /**
     * Normalizes spoken speech input into standard structured values.
     */
    @PostMapping("/normalize")
    public ResponseEntity<VoiceNormalizationResponse> normalizeSpokenInput(
            @Valid @RequestBody VoiceNormalizationRequest request) {
        VoiceNormalizationResponse response = voiceGuidanceService.normalizeSpokenInput(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Record speech interaction telemetry for research evaluation.
     */
    @PostMapping("/telemetry")
    public ResponseEntity<VoiceTelemetryResponse> recordTelemetry(
            @Valid @RequestBody VoiceTelemetryRequest request) {
        VoiceTelemetryResponse response = voiceGuidanceService.recordTelemetry(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get aggregated voice interaction statistics for research evaluation.
     */
    @GetMapping("/telemetry/stats")
    public ResponseEntity<VoiceStatsResponse> getVoiceStats() {
        VoiceStatsResponse stats = voiceGuidanceService.getVoiceStats();
        return ResponseEntity.ok(stats);
    }
}
