package com.licensing.platform.controller;

import com.licensing.platform.dto.ResearchBenchmarkResponse;
import com.licensing.platform.service.ResearchEvaluationBenchmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/research")
public class ResearchBenchmarkController {

    private final ResearchEvaluationBenchmarkService benchmarkService;

    public ResearchBenchmarkController(ResearchEvaluationBenchmarkService benchmarkService) {
        this.benchmarkService = benchmarkService;
    }

    /**
     * Executes the standardized research benchmark comparison between the baseline
     * exact-match OCR rejection method and the proposed confidence-aware explainable pre-screening
     * engine across the 60-sample synthetic dataset.
     */
    @GetMapping("/benchmark")
    public ResponseEntity<ResearchBenchmarkResponse> getBenchmarkEvaluation() {
        ResearchBenchmarkResponse response = benchmarkService.runBenchmarkEvaluation();
        return ResponseEntity.ok(response);
    }
}
