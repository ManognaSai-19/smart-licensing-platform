package com.licensing.platform.controller;

import com.licensing.platform.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        HealthResponse response = new HealthResponse(
                "UP",
                "Smart Digital Licensing Platform API",
                "0.1.0-SNAPSHOT",
                Instant.now(),
                Map.of(
                        "environment", "development",
                        "database", "unconfigured-phase1",
                        "ocrProvider", "mock",
                        "speechFallback", "enabled"
                )
        );
        return ResponseEntity.ok(response);
    }
}
