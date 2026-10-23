package com.licensing.platform.repository;

import com.licensing.platform.model.Application;
import com.licensing.platform.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByReferenceNumber(String referenceNumber);
    List<Application> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<Application> findByStatus(ApplicationStatus status);
    List<Application> findByServiceDepartmentId(Long departmentId);
    List<Application> findByServiceDepartmentIdAndStatus(Long departmentId, ApplicationStatus status);
    boolean existsByReferenceNumber(String referenceNumber);
}
