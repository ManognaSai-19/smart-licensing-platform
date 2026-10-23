package com.licensing.platform.controller;

import com.licensing.platform.dto.*;
import com.licensing.platform.service.ServiceCatalogueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceCatalogueController {

    private final ServiceCatalogueService serviceCatalogueService;

    public ServiceCatalogueController(ServiceCatalogueService serviceCatalogueService) {
        this.serviceCatalogueService = serviceCatalogueService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceSummaryResponse>> getServices(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(serviceCatalogueService.getServices(departmentId, query, activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDetailResponse> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceCatalogueService.getServiceById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ServiceDetailResponse> getServiceByCode(@PathVariable String code) {
        return ResponseEntity.ok(serviceCatalogueService.getServiceByCode(code));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceDetailResponse> createService(@Valid @RequestBody ServiceCreateRequest request) {
        ServiceDetailResponse created = serviceCatalogueService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceDetailResponse> updateService(@PathVariable Long id,
                                                               @Valid @RequestBody ServiceUpdateRequest request) {
        ServiceDetailResponse updated = serviceCatalogueService.updateService(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateService(@PathVariable Long id) {
        serviceCatalogueService.deactivateService(id);
        return ResponseEntity.noContent().build();
    }

    // Dynamic Fields Management
    @PostMapping("/{serviceId}/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceFieldResponse> addField(@PathVariable Long serviceId,
                                                         @Valid @RequestBody ServiceFieldRequest request) {
        ServiceFieldResponse created = serviceCatalogueService.addField(serviceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{serviceId}/fields/{fieldId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceFieldResponse> updateField(@PathVariable Long serviceId,
                                                            @PathVariable Long fieldId,
                                                            @Valid @RequestBody ServiceFieldRequest request) {
        ServiceFieldResponse updated = serviceCatalogueService.updateField(serviceId, fieldId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{serviceId}/fields/{fieldId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteField(@PathVariable Long serviceId,
                                            @PathVariable Long fieldId) {
        serviceCatalogueService.deleteField(serviceId, fieldId);
        return ResponseEntity.noContent().build();
    }

    // Required Document Types Management
    @PostMapping("/{serviceId}/documents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RequiredDocumentTypeResponse> addRequiredDocument(
            @PathVariable Long serviceId,
            @Valid @RequestBody RequiredDocumentTypeRequest request) {
        RequiredDocumentTypeResponse created = serviceCatalogueService.addRequiredDocument(serviceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{serviceId}/documents/{docId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RequiredDocumentTypeResponse> updateRequiredDocument(
            @PathVariable Long serviceId,
            @PathVariable Long docId,
            @Valid @RequestBody RequiredDocumentTypeRequest request) {
        RequiredDocumentTypeResponse updated = serviceCatalogueService.updateRequiredDocument(serviceId, docId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{serviceId}/documents/{docId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRequiredDocument(@PathVariable Long serviceId,
                                                       @PathVariable Long docId) {
        serviceCatalogueService.deleteRequiredDocument(serviceId, docId);
        return ResponseEntity.noContent().build();
    }
}
