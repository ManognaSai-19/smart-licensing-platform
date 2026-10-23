package com.licensing.platform.repository;

import com.licensing.platform.model.ReviewDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewDecisionRepository extends JpaRepository<ReviewDecision, Long> {
    List<ReviewDecision> findByApplicationId(Long applicationId);
    List<ReviewDecision> findByOfficerId(Long officerId);
}
