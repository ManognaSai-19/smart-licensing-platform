package com.licensing.platform.controller;

import com.licensing.platform.dto.HealthResponse;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final Flyway flyway;

    @Autowired
    public HealthController(@Autowired(required = false) Flyway flyway) {
        this.flyway = flyway;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        String dbStatus = "configured-jpa";
        if (flyway != null && flyway.info() != null && flyway.info().current() != null) {
            dbStatus = "Flyway v" + flyway.info().current().getVersion().getVersion() + " (" + flyway.info().current().getDescription() + ")";
        }

        HealthResponse response = new HealthResponse(
                "UP",
                "Smart Digital Licensing Platform API",
                "0.1.0-SNAPSHOT",
                Instant.now(),
                Map.of(
                        "environment", "development",
                        "database", dbStatus,
                        "ocrProvider", "mock",
                        "speechFallback", "enabled"
                )
        );
        return ResponseEntity.ok(response);
    }
}
