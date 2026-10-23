package com.licensing.platform.repository;

import com.licensing.platform.model.Application;
import com.licensing.platform.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByReferenceNumber(String referenceNumber);

    List<Application> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    List<Application> findByStatusOrderByCreatedAtDesc(ApplicationStatus status);

    List<Application> findByServiceDepartmentIdOrderByCreatedAtDesc(Long departmentId);

    List<Application> findByServiceDepartmentIdAndStatusOrderByCreatedAtDesc(Long departmentId, ApplicationStatus status);

    List<Application> findByServiceDepartmentIdInAndStatusInOrderByCreatedAtDesc(Collection<Long> departmentIds, Collection<ApplicationStatus> statuses);

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("SELECT a FROM Application a WHERE (:status IS NULL OR a.status = :status) " +
           "AND (:departmentId IS NULL OR a.service.department.id = :departmentId) " +
           "AND (:query IS NULL OR LOWER(a.referenceNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(a.citizen.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(a.citizen.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.createdAt DESC")
    List<Application> searchApplications(@Param("status") ApplicationStatus status,
                                        @Param("departmentId") Long departmentId,
                                        @Param("query") String query);
}
