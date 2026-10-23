package com.licensing.platform.repository;

import com.licensing.platform.model.ServiceDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceDefinitionRepository extends JpaRepository<ServiceDefinition, Long> {
    Optional<ServiceDefinition> findByCode(String code);
    List<ServiceDefinition> findByActiveTrue();
    List<ServiceDefinition> findByDepartmentId(Long departmentId);
}
