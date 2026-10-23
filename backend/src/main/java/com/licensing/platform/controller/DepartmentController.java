package com.licensing.platform.controller;

import com.licensing.platform.dto.DepartmentRequest;
import com.licensing.platform.dto.DepartmentResponse;
import com.licensing.platform.service.ServiceCatalogueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final ServiceCatalogueService serviceCatalogueService;

    public DepartmentController(ServiceCatalogueService serviceCatalogueService) {
        this.serviceCatalogueService = serviceCatalogueService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {
        return ResponseEntity.ok(serviceCatalogueService.getAllDepartments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceCatalogueService.getDepartmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse created = serviceCatalogueService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> updateDepartment(@PathVariable Long id,
                                                               @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse updated = serviceCatalogueService.updateDepartment(id, request);
        return ResponseEntity.ok(updated);
    }
}
