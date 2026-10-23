package com.licensing.platform.repository;

import com.licensing.platform.model.PrescreeningFinding;
import com.licensing.platform.model.enums.FindingOutcome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescreeningFindingRepository extends JpaRepository<PrescreeningFinding, Long> {
    List<PrescreeningFinding> findByApplicationId(Long applicationId);
    List<PrescreeningFinding> findByApplicationIdAndOutcome(Long applicationId, FindingOutcome outcome);
}
