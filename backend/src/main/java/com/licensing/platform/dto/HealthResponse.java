package com.licensing.platform.dto;

import java.time.Instant;
import java.util.Map;

public record HealthResponse(
        String status,
        String service,
        String version,
        Instant timestamp,
        Map<String, Object> details
) {
}
