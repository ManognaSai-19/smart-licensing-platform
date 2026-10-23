package com.licensing.platform.repository;

import com.licensing.platform.model.ServiceDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceDefinitionRepository extends JpaRepository<ServiceDefinition, Long> {

    Optional<ServiceDefinition> findByCode(String code);

    boolean existsByCode(String code);

    List<ServiceDefinition> findByActiveTrue();

    List<ServiceDefinition> findByDepartmentId(Long departmentId);

    List<ServiceDefinition> findByDepartmentIdAndActiveTrue(Long departmentId);

    @Query("SELECT s FROM ServiceDefinition s WHERE (:activeOnly = false OR s.active = true) " +
           "AND (:departmentId IS NULL OR s.department.id = :departmentId) " +
           "AND (:query IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(s.code) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY s.name ASC")
    List<ServiceDefinition> searchServices(@Param("departmentId") Long departmentId,
                                          @Param("query") String query,
                                          @Param("activeOnly") boolean activeOnly);
}
