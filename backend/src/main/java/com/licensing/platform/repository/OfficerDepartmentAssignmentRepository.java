package com.licensing.platform.repository;

import com.licensing.platform.model.OfficerDepartmentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficerDepartmentAssignmentRepository extends JpaRepository<OfficerDepartmentAssignment, Long> {
    List<OfficerDepartmentAssignment> findByUserId(Long userId);
    List<OfficerDepartmentAssignment> findByDepartmentId(Long departmentId);
    boolean existsByUserIdAndDepartmentId(Long userId, Long departmentId);
    Optional<OfficerDepartmentAssignment> findByUserIdAndDepartmentId(Long userId, Long departmentId);
}
