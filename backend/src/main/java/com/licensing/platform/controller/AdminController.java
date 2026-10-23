package com.licensing.platform.controller;

import com.licensing.platform.dto.AuditLogResponse;
import com.licensing.platform.model.AuditLog;
import com.licensing.platform.model.enums.ApplicationStatus;
import com.licensing.platform.model.enums.Role;
import com.licensing.platform.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final DepartmentRepository departmentRepository;
    private final ServiceDefinitionRepository serviceRepository;

    public AdminController(AuditLogRepository auditLogRepository,
                           UserRepository userRepository,
                           ApplicationRepository applicationRepository,
                           DepartmentRepository departmentRepository,
                           ServiceDefinitionRepository serviceRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.departmentRepository = departmentRepository;
        this.serviceRepository = serviceRepository;
    }

    /**
     * Retrieve system audit trail logs.
     */
    @GetMapping("/audit")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByCreatedAtDesc();
        List<AuditLogResponse> dtoList = logs.stream()
                .map(l -> new AuditLogResponse(
                        l.getId(),
                        l.getActor() != null ? l.getActor().getId() : null,
                        l.getActor() != null ? l.getActor().getFullName() : "SYSTEM",
                        l.getActor() != null ? l.getActor().getEmail() : "system@platform",
                        l.getAction(),
                        l.getResourceType(),
                        l.getResourceId(),
                        l.getIpAddress(),
                        l.getDetails(),
                        l.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    /**
     * Retrieve aggregated platform statistics for admin oversight.
     */
    @GetMapping("/system-stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalCitizens = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CITIZEN).count();
        long totalOfficers = userRepository.findAll().stream().filter(u -> u.getRole() == Role.OFFICER).count();
        long totalDepartments = departmentRepository.count();
        long totalServices = serviceRepository.count();
        long totalApplications = applicationRepository.count();

        Map<String, Long> statusCounts = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCounts.put(status.name(), applicationRepository.countByStatus(status));
        }

        stats.put("totalUsers", totalUsers);
        stats.put("totalCitizens", totalCitizens);
        stats.put("totalOfficers", totalOfficers);
        stats.put("totalDepartments", totalDepartments);
        stats.put("totalServices", totalServices);
        stats.put("totalApplications", totalApplications);
        stats.put("statusBreakdown", statusCounts);

        return ResponseEntity.ok(stats);
    }
}
