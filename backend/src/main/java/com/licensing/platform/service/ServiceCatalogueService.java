package com.licensing.platform.service;

import com.licensing.platform.dto.*;
import com.licensing.platform.exception.DuplicateResourceException;
import com.licensing.platform.exception.ResourceNotFoundException;
import com.licensing.platform.model.Department;
import com.licensing.platform.model.RequiredDocumentType;
import com.licensing.platform.model.ServiceDefinition;
import com.licensing.platform.model.ServiceField;
import com.licensing.platform.repository.DepartmentRepository;
import com.licensing.platform.repository.RequiredDocumentTypeRepository;
import com.licensing.platform.repository.ServiceDefinitionRepository;
import com.licensing.platform.repository.ServiceFieldRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceCatalogueService {

    private static final Logger log = LoggerFactory.getLogger(ServiceCatalogueService.class);

    private final DepartmentRepository departmentRepository;
    private final ServiceDefinitionRepository serviceRepository;
    private final ServiceFieldRepository serviceFieldRepository;
    private final RequiredDocumentTypeRepository documentTypeRepository;

    public ServiceCatalogueService(DepartmentRepository departmentRepository,
                                   ServiceDefinitionRepository serviceRepository,
                                   ServiceFieldRepository serviceFieldRepository,
                                   RequiredDocumentTypeRepository documentTypeRepository) {
        this.departmentRepository = departmentRepository;
        this.serviceRepository = serviceRepository;
        this.serviceFieldRepository = serviceFieldRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    // ==========================================
    // DEPARTMENTS
    // ==========================================

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToDepartmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDepartmentResponse(dept);
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Department already exists with code: " + request.getCode());
        }

        Department department = new Department(
                request.getCode().trim().toUpperCase(),
                request.getName().trim(),
                request.getDescription()
        );

        Department saved = departmentRepository.save(department);
        log.info("Created department '{}' (ID: {})", saved.getCode(), saved.getId());
        return mapToDepartmentResponse(saved);
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        dept.setName(request.getName().trim());
        dept.setDescription(request.getDescription());

        Department updated = departmentRepository.save(dept);
        log.info("Updated department '{}' (ID: {})", updated.getCode(), updated.getId());
        return mapToDepartmentResponse(updated);
    }

    private DepartmentResponse mapToDepartmentResponse(Department dept) {
        long serviceCount = serviceRepository.findByDepartmentId(dept.getId()).size();
        return new DepartmentResponse(
                dept.getId(),
                dept.getCode(),
                dept.getName(),
                dept.getDescription(),
                serviceCount,
                dept.getCreatedAt()
        );
    }

    // ==========================================
    // SERVICES
    // ==========================================

    @Transactional(readOnly = true)
    public List<ServiceSummaryResponse> getServices(Long departmentId, String query, Boolean activeOnly) {
        boolean filterActive = activeOnly == null || activeOnly;
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        List<ServiceDefinition> services = serviceRepository.searchServices(departmentId, cleanQuery, filterActive);
        return services.stream()
                .map(this::mapToServiceSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceDetailResponse getServiceById(Long id) {
        ServiceDefinition service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return mapToServiceDetail(service);
    }

    @Transactional(readOnly = true)
    public ServiceDetailResponse getServiceByCode(String code) {
        ServiceDefinition service = serviceRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with code: " + code));
        return mapToServiceDetail(service);
    }

    public ServiceDetailResponse createService(ServiceCreateRequest request) {
        if (serviceRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Service already exists with code: " + request.getCode());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        ServiceDefinition service = new ServiceDefinition(
                request.getCode().trim().toUpperCase(),
                request.getName().trim(),
                request.getDescription(),
                department,
                request.getSampleFee(),
                request.getProcessingTimeDays()
        );
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        ServiceDefinition saved = serviceRepository.save(service);

        // Save optional dynamic fields
        if (request.getFields() != null && !request.getFields().isEmpty()) {
            int order = 1;
            for (ServiceFieldRequest fieldReq : request.getFields()) {
                ServiceField field = new ServiceField(
                        saved,
                        fieldReq.getFieldKey().trim(),
                        fieldReq.getLabelEn().trim(),
                        fieldReq.getLabelTe() != null ? fieldReq.getLabelTe().trim() : fieldReq.getLabelEn().trim(),
                        fieldReq.getDataType(),
                        fieldReq.getRequired() != null ? fieldReq.getRequired() : true,
                        fieldReq.getValidationRules(),
                        fieldReq.getOptionsJson(),
                        fieldReq.getDisplayOrder() != null && fieldReq.getDisplayOrder() > 0 ? fieldReq.getDisplayOrder() : order++
                );
                serviceFieldRepository.save(field);
            }
        }

        // Save optional required documents
        if (request.getRequiredDocuments() != null && !request.getRequiredDocuments().isEmpty()) {
            for (RequiredDocumentTypeRequest docReq : request.getRequiredDocuments()) {
                RequiredDocumentType doc = new RequiredDocumentType(
                        saved,
                        docReq.getDocumentCode().trim().toUpperCase(),
                        docReq.getNameEn().trim(),
                        docReq.getNameTe() != null ? docReq.getNameTe().trim() : docReq.getNameEn().trim(),
                        docReq.getRequired() != null ? docReq.getRequired() : true,
                        docReq.getAcceptedMimeTypes(),
                        docReq.getMaxSizeBytes()
                );
                documentTypeRepository.save(doc);
            }
        }

        log.info("Created service '{}' (ID: {}) in department '{}'", saved.getCode(), saved.getId(), department.getCode());
        return mapToServiceDetail(saved);
    }

    public ServiceDetailResponse updateService(Long id, ServiceUpdateRequest request) {
        ServiceDefinition service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            service.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            service.setDescription(request.getDescription());
        }
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            service.setDepartment(dept);
        }
        if (request.getSampleFee() != null) {
            service.setSampleFee(request.getSampleFee());
        }
        if (request.getProcessingTimeDays() != null) {
            service.setProcessingTimeDays(request.getProcessingTimeDays());
        }
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        ServiceDefinition updated = serviceRepository.save(service);
        log.info("Updated service '{}' (ID: {})", updated.getCode(), updated.getId());
        return mapToServiceDetail(updated);
    }

    public void deactivateService(Long id) {
        ServiceDefinition service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        service.setActive(false);
        serviceRepository.save(service);
        log.info("Deactivated service '{}' (ID: {})", service.getCode(), service.getId());
    }

    // ==========================================
    // DYNAMIC FIELDS
    // ==========================================

    public ServiceFieldResponse addField(Long serviceId, ServiceFieldRequest request) {
        ServiceDefinition service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (serviceFieldRepository.existsByServiceIdAndFieldKey(serviceId, request.getFieldKey().trim())) {
            throw new DuplicateResourceException("Field key '" + request.getFieldKey() + "' already exists for service: " + service.getCode());
        }

        int nextOrder = request.getDisplayOrder() != null && request.getDisplayOrder() > 0
                ? request.getDisplayOrder()
                : serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(serviceId).size() + 1;

        ServiceField field = new ServiceField(
                service,
                request.getFieldKey().trim(),
                request.getLabelEn().trim(),
                request.getLabelTe() != null ? request.getLabelTe().trim() : request.getLabelEn().trim(),
                request.getDataType(),
                request.getRequired() != null ? request.getRequired() : true,
                request.getValidationRules(),
                request.getOptionsJson(),
                nextOrder
        );

        ServiceField saved = serviceFieldRepository.save(field);
        log.info("Added field '{}' to service '{}'", saved.getFieldKey(), service.getCode());
        return mapToFieldResponse(saved);
    }

    public ServiceFieldResponse updateField(Long serviceId, Long fieldId, ServiceFieldRequest request) {
        ServiceField field = serviceFieldRepository.findByIdAndServiceId(fieldId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found with id: " + fieldId + " for service: " + serviceId));

        field.setLabelEn(request.getLabelEn().trim());
        if (request.getLabelTe() != null) {
            field.setLabelTe(request.getLabelTe().trim());
        }
        field.setDataType(request.getDataType());
        if (request.getRequired() != null) {
            field.setRequired(request.getRequired());
        }
        field.setValidationRules(request.getValidationRules());
        field.setOptionsJson(request.getOptionsJson());
        if (request.getDisplayOrder() != null) {
            field.setDisplayOrder(request.getDisplayOrder());
        }

        ServiceField updated = serviceFieldRepository.save(field);
        log.info("Updated field '{}' (ID: {})", updated.getFieldKey(), updated.getId());
        return mapToFieldResponse(updated);
    }

    public void deleteField(Long serviceId, Long fieldId) {
        ServiceField field = serviceFieldRepository.findByIdAndServiceId(fieldId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found with id: " + fieldId + " for service: " + serviceId));
        serviceFieldRepository.delete(field);
        log.info("Deleted field '{}' (ID: {}) from service ID: {}", field.getFieldKey(), fieldId, serviceId);
    }

    // ==========================================
    // REQUIRED DOCUMENTS
    // ==========================================

    public RequiredDocumentTypeResponse addRequiredDocument(Long serviceId, RequiredDocumentTypeRequest request) {
        ServiceDefinition service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (documentTypeRepository.existsByServiceIdAndDocumentCode(serviceId, request.getDocumentCode().trim().toUpperCase())) {
            throw new DuplicateResourceException("Document code '" + request.getDocumentCode() + "' already exists for service: " + service.getCode());
        }

        RequiredDocumentType doc = new RequiredDocumentType(
                service,
                request.getDocumentCode().trim().toUpperCase(),
                request.getNameEn().trim(),
                request.getNameTe() != null ? request.getNameTe().trim() : request.getNameEn().trim(),
                request.getRequired() != null ? request.getRequired() : true,
                request.getAcceptedMimeTypes(),
                request.getMaxSizeBytes()
        );

        RequiredDocumentType saved = documentTypeRepository.save(doc);
        log.info("Added required document '{}' to service '{}'", saved.getDocumentCode(), service.getCode());
        return mapToDocResponse(saved);
    }

    public RequiredDocumentTypeResponse updateRequiredDocument(Long serviceId, Long docId, RequiredDocumentTypeRequest request) {
        RequiredDocumentType doc = documentTypeRepository.findByIdAndServiceId(docId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + docId + " for service: " + serviceId));

        doc.setNameEn(request.getNameEn().trim());
        if (request.getNameTe() != null) {
            doc.setNameTe(request.getNameTe().trim());
        }
        if (request.getRequired() != null) {
            doc.setRequired(request.getRequired());
        }
        if (request.getAcceptedMimeTypes() != null) {
            doc.setAcceptedMimeTypes(request.getAcceptedMimeTypes());
        }
        if (request.getMaxSizeBytes() != null) {
            doc.setMaxSizeBytes(request.getMaxSizeBytes());
        }

        RequiredDocumentType updated = documentTypeRepository.save(doc);
        log.info("Updated required document '{}' (ID: {})", updated.getDocumentCode(), updated.getId());
        return mapToDocResponse(updated);
    }

    public void deleteRequiredDocument(Long serviceId, Long docId) {
        RequiredDocumentType doc = documentTypeRepository.findByIdAndServiceId(docId, serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + docId + " for service: " + serviceId));
        documentTypeRepository.delete(doc);
        log.info("Deleted required document '{}' (ID: {}) from service ID: {}", doc.getDocumentCode(), docId, serviceId);
    }

    // ==========================================
    // MAPPERS
    // ==========================================

    private ServiceSummaryResponse mapToServiceSummary(ServiceDefinition s) {
        List<ServiceField> fields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(s.getId());
        List<RequiredDocumentType> docs = documentTypeRepository.findByServiceId(s.getId());

        return new ServiceSummaryResponse(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getDescription(),
                s.getDepartment().getId(),
                s.getDepartment().getCode(),
                s.getDepartment().getName(),
                s.isActive(),
                s.getSampleFee(),
                s.getProcessingTimeDays(),
                fields.size(),
                docs.size(),
                s.getCreatedAt()
        );
    }

    private ServiceDetailResponse mapToServiceDetail(ServiceDefinition s) {
        List<ServiceField> fields = serviceFieldRepository.findByServiceIdOrderByDisplayOrderAsc(s.getId());
        List<RequiredDocumentType> docs = documentTypeRepository.findByServiceId(s.getId());

        List<ServiceFieldResponse> fieldResponses = fields.stream()
                .map(this::mapToFieldResponse)
                .collect(Collectors.toList());

        List<RequiredDocumentTypeResponse> docResponses = docs.stream()
                .map(this::mapToDocResponse)
                .collect(Collectors.toList());

        return new ServiceDetailResponse(
                s.getId(),
                s.getCode(),
                s.getName(),
                s.getDescription(),
                s.getDepartment().getId(),
                s.getDepartment().getCode(),
                s.getDepartment().getName(),
                s.isActive(),
                s.getSampleFee(),
                s.getProcessingTimeDays(),
                fieldResponses.size(),
                docResponses.size(),
                s.getCreatedAt(),
                fieldResponses,
                docResponses
        );
    }

    private ServiceFieldResponse mapToFieldResponse(ServiceField f) {
        return new ServiceFieldResponse(
                f.getId(),
                f.getFieldKey(),
                f.getLabelEn(),
                f.getLabelTe(),
                f.getDataType(),
                f.isRequired(),
                f.getValidationRules(),
                f.getOptionsJson(),
                f.getDisplayOrder()
        );
    }

    private RequiredDocumentTypeResponse mapToDocResponse(RequiredDocumentType d) {
        return new RequiredDocumentTypeResponse(
                d.getId(),
                d.getDocumentCode(),
                d.getNameEn(),
                d.getNameTe(),
                d.isRequired(),
                d.getAcceptedMimeTypes(),
                d.getMaxSizeBytes()
        );
    }
}
